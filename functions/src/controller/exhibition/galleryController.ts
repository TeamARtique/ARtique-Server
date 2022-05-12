import { Request, Response } from "express";
import exhibitionService from "../../service/exhibitionService";
import artworkService from "../../service/artworkService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /gallery/:exhibitionId
 *  @desc GET AR gallery detail data (AR 전시 상세조회) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    
    try {
        client = await db.connect(req);
        const galleryDetailData = await exhibitionService.getDetailExhibition(client, exhibitionId);
        const artworkData = await artworkService.getArtworks(client, exhibitionId);
        const likeCount = await likeService.getLikeCount(client, exhibitionId);
        const isLiked = await likeService.getIsLiked(client, exhibitionId, userId); 
        const bookmarkCount = await bookmarkService.getBookmarkCount(client, exhibitionId);
        const isBookmarked = await bookmarkService.getIsBookmarked(client, exhibitionId, userId);
        if (!galleryDetailData || !likeCount || !isLiked || !bookmarkCount || !isBookmarked) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let finalData = {
            gallery: {
                exhibitionId: galleryDetailData.id,
                gallerySize: galleryDetailData.gallerySize,
                galleryTheme: galleryDetailData.theme,
                isPublic: galleryDetailData.isPublic,
            },
            artworks: artworkData,
            like: {
                isLiked: isLiked.isLiked == 1? true : false,
                likeCount: parseInt(likeCount.likeCount)
            },
            bookmark: {
                isBookmarked: isBookmarked.isLiked == 1? true : false,
                bookmarkCount: parseInt(bookmarkCount.bookmarkCount)
            }
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_AR_GALLERY_DETAIL_SUCCESS, finalData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 