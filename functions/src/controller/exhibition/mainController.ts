import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
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
    try {
        client = await db.connect(req);
        const categoryExhibitionList = await exhibitionService.getMainPostByCategory(client, category);
        let popularExhibitionList = await exhibitionService.getMainPopularPostByCategory(client, category, req.body.user.id);

        let popularExhibitionPostList = await Promise.all(popularExhibitionList.map(async (popularData: any) => {
            let artistData = await userService.findUserById(client, popularData.userId);
            let data = {
                exhibitionId: popularData.exhibitionId,
                title: popularData.title,
                posterImage: popularData.posterImage,
                posterTheme: popularData.posterTheme,
                artist: {
                    artistId: popularData.userId,
                    nickname: artistData.nickname,
                },
                like: {
                    isLiked: popularData.isLiked == 1? true : false,
                    likeCount: parseInt(popularData.likeCount)
                },
                bookmark: {
                    isBookmarked: popularData.isBookmarked == 1? true : false,
                    bookmarkCount: parseInt(popularData.bookmarkCount)
                }
            }
            return data;
        }));

        let finalData = {
            forArtiExhibition: popularExhibitionPostList,
            popularExhibition: popularExhibitionPostList,
            categoryExhibition: [categoryExhibitionList]
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_MAIN_SUCCESS, finalData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 