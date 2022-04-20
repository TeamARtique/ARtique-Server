import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

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
    console.log("params: ", category, sortType, userId);
    
    try {
        client = await db.connect(req);
        let popularExhibitionList;
        if (sortType == "recent") {
            popularExhibitionList = await exhibitionService.getEntireCategoryExhibitionDefault(client, category, userId);
        } else {
            popularExhibitionList = await exhibitionService.getEntireCategoryExhibitionByLike(client, category, userId);
        }

        let popularExhibitionPostList = await Promise.all(popularExhibitionList.map(async (exhibitionData: any) => {
            let artistData = await userService.findUserById(client, exhibitionData.userId);
            let data = {
                exhibitionId: exhibitionData.id,
                title: exhibitionData.title,
                posterImage: exhibitionData.posterImage,
                posterTheme: exhibitionData.posterTheme,
                createdAt: exhibitionData.createdAt,
                artist: {
                    artistId: exhibitionData.userId,
                    nickname: artistData.nickname,
                },
                like: {
                    isLiked: exhibitionData.isLiked == 1? true : false,
                    likeCount: parseInt(exhibitionData.likeCount)
                },
                bookmark: {
                    isBookmarked: exhibitionData.isBookmarked == 1? true : false,
                    bookmarkCount: parseInt(exhibitionData.bookmarkCount)
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