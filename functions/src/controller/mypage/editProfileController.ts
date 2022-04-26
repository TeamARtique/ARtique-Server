import { Request, Response } from "express";
import userService from "../../service/userService";
import userProfileDTO from '../../interface/req/userProfileDTO';
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route PUT /mypage/profile
 *  @desc PUT edit user data (유저의 프로필(정보) 수정)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;
    if (!userId || !req.body.profileImage || !req.body.nickname || !req.body.introduction || !req.body.website) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    // body
    const exhibitionData: userProfileDTO = {
        profileImage: req.body.profileImage,
        nickname: req.body.nickname, 
        introduction: req.body.introduction,
        website: req.body.website
    };
    
    try {
        client = await db.connect(req);
        const userEditData = await userService.updateUser(client, userId, exhibitionData);
        if (!userEditData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let userProfileData = {
            user: {
                nickname: userEditData.nickname,
                profileImage: userEditData.profileImage,
                introduction: userEditData.introduction,
                website: userEditData.website
            }
        }
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.USER_PROFILE_UPDATE_SUCCESS, userProfileData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 