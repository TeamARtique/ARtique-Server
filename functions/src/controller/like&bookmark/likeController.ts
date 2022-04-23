import { Request, Response } from "express";
import likeService from "../../service/likeService";
import exhibitionService from "../../service/exhibitionService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /like/:exhibitionId
 *  @desc GET update like data (좋아요 업데이트) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    let exhibitionLike;
    
    try {
        client = await db.connect(req);
        const existExhibitionData = await exhibitionService.getDetailExhibition(client, exhibitionId);
        if (!existExhibitionData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        } else {
            const likeData = await likeService.getLikeByExhibitionId(client, exhibitionId, userId);
            if (!likeData) {
                exhibitionLike = await likeService.createLikeByExhibitionId(client, exhibitionId, userId);
            } else {
                exhibitionLike = await likeService.updateLikeByExhibitionId(client, exhibitionId, userId);
            }
            if (!exhibitionLike) {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            }
    
            let isLiked;
            if (exhibitionLike.isLiked == true) {
                isLiked = false
            } else {
                isLiked = true
            }
    
            let finalData = {
                "exhibitionId": exhibitionLike.exhibitionId,
                "isLiked": isLiked
            }
            res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_LIKE_UPDATE_SUCCESS, finalData));
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