import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService"
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /exhibition/main/:category
 *  @desc GET Home exhibition list by category (카테고리별 홈 리스트 조회) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let category = parseInt(req.params.category);
    let userId = req.body.user.id;
    try {
        client = await db.connect(req);
        const categoryExhibitionList = await exhibitionService.getMainExhibitionByCategory(client, category);
        if (!categoryExhibitionList) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
        
        let popularExhibitionList = await exhibitionService.getMainPopularExhibitionByCategory(client, category);
        if (!popularExhibitionList) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let popularExhibitionPostList = await Promise.all(popularExhibitionList.map(async (popularData: any) => {
            let artistData = await userService.findUserById(client, popularData.userId);
            const likeCount = await likeService.getLikeCount(client, popularData.id);
            const isLiked = await likeService.getIsLiked(client, popularData.id, userId); 
            const bookmarkCount = await bookmarkService.getBookmarkCount(client, popularData.id);
            const isBookmarked = await bookmarkService.getIsBookmarked(client, popularData.id, userId);

            let data = {
                exhibitionId: popularData.id,
                title: popularData.title,
                posterImage: popularData.posterImage,
                posterTheme: popularData.posterTheme,
                artist: {
                    artistId: popularData.userId,
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

        let mainData = {
            forArtiExhibition: popularExhibitionPostList,
            popularExhibition: popularExhibitionPostList,
            categoryExhibition: [categoryExhibitionList]
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_MAIN_SUCCESS, mainData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 