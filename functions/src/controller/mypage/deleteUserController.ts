import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /user/delete
 *  @desc POST delete user data (유저의 프로필(정보) 삭제 - 회원탈퇴)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;
    if (!userId) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }
    
    try {
        client = await db.connect(req);
        const userDeleteResult = await userService.deleteUser(client, userId);
        if (userDeleteResult.isDeleted === false) {
            console.log("회원탈퇴 실패");
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        } else {
            const exhibitionDeleteResult = await exhibitionService.deleteExhibitionByUserId(client, userId);
            await likeService.deleteLikeByUserId(client, userId);
            await bookmarkService.deleteBookmarkByUserId(client, userId);

            if (exhibitionDeleteResult.bool === true) {
                res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.USER_DELETE_SUCCESS));
            } else {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            }
        }
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 