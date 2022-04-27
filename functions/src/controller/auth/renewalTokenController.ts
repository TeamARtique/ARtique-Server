import { Request, Response } from "express";
const jwtHandlers = require('../../lib/jwtHandler');
import userService from "../../service/userService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");
const { TOKEN_INVALID, TOKEN_EXPIRED } = require("../../constants/jwt");

/**
 *  @route POST /auth/token
 *  @desc Renewal token (토큰 갱신)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    if (!req.body.refreshToken) {
        // ⛔️ body의 값이 없을 때 BAD_REQUEST response
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    const refreshToken = req.body.refreshToken;

    try {
        let client;
        client = await db.connect();
        const decodedToken = await jwtHandlers.verify(refreshToken);

        if (decodedToken === TOKEN_INVALID) {
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
        }

        if (decodedToken === TOKEN_EXPIRED) {
            res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
        } 

        // ✅ 엑세스토큰 갱신
        let findUser = await userService.findUserByRefreshToken(client, refreshToken);
        let tokenData;
        if (!findUser) {
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
        } else {
            const jwtToken = jwtHandlers.access(findUser);
            tokenData = {
                accessToken: jwtToken.accesstoken,
                refreshToken: refreshToken
            }
        }
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TOKEN_RENEWAL_SUCCESS, tokenData));
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
