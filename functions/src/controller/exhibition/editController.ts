import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService";
import exhibitionDTO from '../../interface/req/exhibitionDTO';
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route PUT /exhibition/:exhibitionId
 *  @desc PUT edit exhibition detail data (전시글 상세 수정) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    if (!exhibitionId || !userId || !req.body.title || !req.body.category || !req.body.posterImage || !req.body.description || !req.body.tag || !req.body.isPublic) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    // body
    const exhibitionData: exhibitionDTO = {
        title: req.body.title,
        category: req.body.category, 
        posterImage: req.body.posterImage,
        description: req.body.description,
        tag: req.body.tag,
        isPublic: req.body.isPublic
    };
    
    try {
        client = await db.connect(req);
        const exhibitionEditData = await exhibitionService.putEditDetailExhibition(client, exhibitionId, exhibitionData);
        const likeCount = await likeService.getLikeCount(client, exhibitionId);
        const isLiked = await likeService.getIsLiked(client, exhibitionId, userId); 
        const bookmarkCount = await bookmarkService.getBookmarkCount(client, exhibitionId);
        const isBookmarked = await bookmarkService.getIsBookmarked(client, exhibitionId, userId);
        if (!exhibitionEditData || !likeCount || !isLiked || !bookmarkCount || !isBookmarked) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
        let artistData = await userService.findUserById(client, exhibitionEditData.userId);
        if (!artistData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let finalData = {
            exhibition: {
                exhibitionId: exhibitionEditData.id,
                title: exhibitionEditData.title,
                posterImage: exhibitionEditData.posterImage,
                description: exhibitionEditData.description,
                tag: exhibitionEditData.tag,
                isPublic: exhibitionEditData.isPublic,
                createdAt: exhibitionEditData.createdAt,
            },
            artist: {
                artistId: exhibitionEditData.userId,
                isWriter: userId == exhibitionEditData.userId ? true : false,
                nickname: artistData.nickname,
            },
            like: {
                isLiked: isLiked.isLiked == 1? true : false,
                likeCount: parseInt(likeCount.likeCount)
            },
            bookmark: {
                isBookmarked: isBookmarked.isLiked == 1? true : false,
                bookmarkCount: parseInt(bookmarkCount.bookmarkCount)
            }
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_DETAIL_UPDATE_SUCCESS, finalData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 