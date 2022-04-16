import { Request, Response } from "express";
const axios = require('axios');
const jwtHandlers = require('../lib/jwtHandler');
import config from "../config";
import userService from "../service/userService";
const qs = require('qs');
const db = require('../db/db');
const responseMessage = require("../constants/responseMessage");
const statusCode = require("../constants/statusCode");
const util = require("../lib/util");

/**
 *  @route POST /auth/kakaoLogin
 *  @desc Authenticate user & get token(로그인)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let access_token = req.body.accessToken;
    const refresh_token = req.body.refreshToken;
    const jwtRefreshtoken = jwtHandlers.refresh();

    try {
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

        if (newToken.status != 200) {   
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_ERROR));
        }
        access_token = newToken.data.access_token;
        console.log("new access token:", access_token);

        const user = await axios({
            method: 'GET',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }); // user 정보 받아오기
        
        let client;
        client = await db.connect();
        const checkUser = await userService.findUserByEmail(client, user.data.kakao_account.email);
        if (!checkUser) {
            //DB에 없는 유저는 새로 생성한 후 토큰 발급한다.
            const newUser = await userService.createUser(client, user.data.kakao_account.email, user.data.kakao_account.profile.nickname, user.data.kakao_account.profile.profile_image_url);
            const jwtAccessToken = jwtHandlers.access(newUser.id); 
        
            jwtHandlers(newUser._id);
            let signData = {
                user: newUser,
                token: jwtAccessToken,
                access_token: access_token,
                refresh_token: jwtRefreshtoken
            }
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, signData));
        }
        // DB에 이미 존재하는 유저는 토큰 발급 후 전달
        const jwtToken = jwtHandlers.access(checkUser.id);
        userService.updateRefreshToken(client, checkUser.id, jwtRefreshtoken.refreshtoken);
        let loginData = {
            user: checkUser,
            accessToken: jwtToken.accesstoken,
            refreshToken: jwtRefreshtoken.refreshtoken
        }
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, loginData));
    } catch (error) {
        console.log(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};
