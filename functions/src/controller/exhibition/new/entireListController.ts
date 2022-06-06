import { Request, Response } from "express";
import userService from "../../../service/userService";
import exhibitionService from "../../../service/exhibitionService";
import likeService from "../../../service/likeService"
import bookmarkService from "../../../service/bookmarkService"
const db = require('../../../db/db');
const responseMessage = require("../../../constants/responseMessage");
const statusCode = require("../../../constants/statusCode");
const util = require("../../../lib/util");

/**
 *  @route GET /exhibition/list/:category?sort=recent
 *  @desc GET exhibition entire data list (전시 상세조회)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let category = parseInt(req.params.category);
    let sortType = req.query.sort;
    let userId = req.body.user.id;

    try {
        client = await db.connect(req);
        let popularExhibitionList;

        if (category == null || category < 1 || category > 6) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INCORRECT_CATEGORY));
        }

        if (sortType == "recent") {
            popularExhibitionList = await exhibitionService.getEntireCategoryExhibitionDefault(client, category);
        } else if (sortType == "like") {
            popularExhibitionList = await exhibitionService.getEntireCategoryExhibitionByLike(client, category);
        } else {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INCORRECT_SORT));
        }

        if (!popularExhibitionList) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let popularExhibitionPostList = await Promise.all(popularExhibitionList.map(async (exhibitionData: any) => {
            let artistData = await userService.findUserById(client, exhibitionData.userId);
            const likeCount = await likeService.getLikeCount(client, exhibitionData.id);
            const isLiked = await likeService.getIsLiked(client, exhibitionData.id, userId); 
            const bookmarkCount = await bookmarkService.getBookmarkCount(client, exhibitionData.id);
            const isBookmarked = await bookmarkService.getIsBookmarked(client, exhibitionData.id, userId);
    
            let data = {
                exhibitionId: exhibitionData.id,
                title: exhibitionData.title,
                posterImage: exhibitionData.posterImage,
                createdAt: exhibitionData.createdAt,
                artist: {
                    artistId: exhibitionData.userId,
                    nickname: artistData.nickname,
                },
                like: {
                    isLiked: isLiked.isLiked == 1? true : false,
                    likeCount: parseInt(likeCount.likeCount)
                },
                bookmark: {
                    isBookmarked: isBookmarked.isBookmarked == 1? true : false,
                    bookmarkCount: parseInt(bookmarkCount.bookmarkCount)
                }
            }
            return data;
        }));
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_LIST_SUCCESS, popularExhibitionPostList));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 