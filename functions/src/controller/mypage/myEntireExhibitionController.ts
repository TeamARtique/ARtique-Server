import { Request, Response } from "express";
import mypageService from "../../service/mypageService";
import userService from "../../service/userService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /mypage/exhibition
 *  @desc GET mypage entire exhibition data (마이페이지 등록한 전시 리스트 조회)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;

    try {
        client = await db.connect(req);
        let userData = await mypageService.getMypageUserData(client, userId);
        let myExhibitionData = await mypageService.getMyEntireExhibitionData(client, userId);

        if (!userData || !myExhibitionData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let myExhibitionPostList = await Promise.all(myExhibitionData.map(async (exhibitionData: any) => {
            let artistData = await userService.findUserById(client, exhibitionData.userId);
            const likeCount = await likeService.getLikeCount(client, exhibitionData.id);
            const isLiked = await likeService.getIsLiked(client, exhibitionData.id, userId); 
            const bookmarkCount = await bookmarkService.getBookmarkCount(client, exhibitionData.id);
            const isBookmarked = await bookmarkService.getIsBookmarked(client, exhibitionData.id, userId);
    
            let data = {
                exhibitionId: exhibitionData.id,
                title: exhibitionData.title,
                posterImage: exhibitionData.posterImage,
                posterTheme: exhibitionData.posterTheme,
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

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_MYPAGE_EXHIBITION_SUCCESS, myExhibitionPostList));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 