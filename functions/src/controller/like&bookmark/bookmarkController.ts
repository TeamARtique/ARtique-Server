import { Request, Response } from "express";
import bookmarkService from "../../service/bookmarkService";
import exhibitionService from "../../service/exhibitionService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /bookmark/:exhibitionId
 *  @desc GET update bookmark data (북마크 업데이트) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    let exhibitionBookmark;
    
    try {
        client = await db.connect(req);
        const existExhibitionData = await exhibitionService.getDetailExhibition(client, exhibitionId);
        if (!existExhibitionData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        } else {
            const bookmarkData = await bookmarkService.getBookmarkByExhibitionId(client, exhibitionId, userId);
            if (!bookmarkData) {
                exhibitionBookmark = await bookmarkService.createBookmarkByExhibitionId(client, exhibitionId, userId);
            } else {
                exhibitionBookmark = await bookmarkService.updateBookmarkByExhibitionId(client, exhibitionId, userId);
            }
            if (!exhibitionBookmark) {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            }
    
            let isBookmarked;
            if (exhibitionBookmark.isBookmarked == true) {
                isBookmarked = false
            } else {
                isBookmarked = true
            }
    
            let finalData = {
                "exhibitionId": exhibitionBookmark.exhibitionId,
                "isBookmarked": isBookmarked
            }
            res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_BOOKMARK_UPDATE_SUCCESS, finalData));
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