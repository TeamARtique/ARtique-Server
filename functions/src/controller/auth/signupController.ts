import { Request, Response } from "express";
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @desc SignUp (회원가입 절차)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    try {
        // TODO: 회원가입 세부정보 저장 컨트롤러 호출
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS));
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
