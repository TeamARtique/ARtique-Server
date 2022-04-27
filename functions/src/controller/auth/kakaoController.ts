import { Request, Response } from "express";
const axios = require('axios');
const jwtHandlers = require('../../lib/jwtHandler');
import config from "../../config";
import userService from "../../service/userService";
const qs = require('qs');
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /auth/kakaoLogin
 *  @desc Authenticate user & get token(로그인)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let access_token;
    if (!req.body.refreshToken) {
        // ⛔️ body의 값이 없을 때 BAD_REQUEST response
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    const refresh_token = req.body.refreshToken;
    const jwtRefreshtoken = jwtHandlers.refresh();

    try {
        // ✅ kakao REST API를 사용하여 token 갱신
        const newToken = await axios({
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            url: 'https://kauth.kakao.com/oauth/token',
            data: qs.stringify({
                grant_type: 'refresh_token',
                client_id: config.CLIENT_ID,
                refresh_token: refresh_token
            })
        }); 
        access_token = newToken.data.access_token;

        // ✅ kakao REST API를 사용하여 accessToken을 해독한 후 user 정보 받아오기
        const user = await axios({
            method: 'GET',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }); 
        
        let client;
        client = await db.connect();
        const findUser = await userService.findUserByEmail(client, user.data.kakao_account.email);
        if (!findUser) {
            // ✅ DB에 없는 유저는 새로 생성한 후 토큰 발급
            const newUser = await userService.createUser(client, user.data.kakao_account.email, user.data.kakao_account.profile.nickname, user.data.kakao_account.profile.profile_image_url, jwtRefreshtoken.refreshtoken);
            const jwtAccessToken = jwtHandlers.access(newUser); 

            let signData = {
                user: newUser,
                token: {
                    accessToken: jwtAccessToken.accesstoken,
                    refreshToken: jwtRefreshtoken.refreshtoken
                }
            }
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, signData));
        }
        
        // ✅ DB에 이미 존재하는 유저는 토큰 발급 후 전달
        const jwtToken = jwtHandlers.access(findUser);
        userService.updateRefreshToken(client, findUser.userId, jwtRefreshtoken.refreshtoken);
        let loginData = {
            user: findUser,
            token: {
                accessToken: jwtToken.accesstoken,
                refreshToken: jwtRefreshtoken.refreshtoken
            }
        }
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, loginData));
    } catch (error: any) {
        // ⛔️ client측에서 넘어온 refreshToken이 유효하지 않을 경우
        if (error.response) {
            if (error.response.status === 400) {
                return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_ERROR));
            }
        }
        // ⛔️ 내부 서버 오류
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};
