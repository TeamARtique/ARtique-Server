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
 *  @route GET /mypage/bookmark
 *  @desc GET mypage entire bookmark data (마이페이지 북마크 리스트 조회)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;

    try {
        client = await db.connect(req);
        let userData = await mypageService.getMypageUserData(client, userId);
        let myBookmarkedData = await mypageService.getMyEntireBookmarkedData(client, userId);

        if (!userData || !myBookmarkedData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let myBookmarkPostList = await Promise.all(myBookmarkedData.map(async (bookmarkData: any) => {
            let artistData = await userService.findUserById(client, bookmarkData.userId);
            const likeCount = await likeService.getLikeCount(client, bookmarkData.id);
            const isLiked = await likeService.getIsLiked(client, bookmarkData.id, userId); 
            const bookmarkCount = await bookmarkService.getBookmarkCount(client, bookmarkData.id);
            const isBookmarked = await bookmarkService.getIsBookmarked(client, bookmarkData.id, userId);
    
            let data = {
                exhibitionId: bookmarkData.id,
                title: bookmarkData.title,
                posterImage: bookmarkData.posterImage,
                posterTheme: bookmarkData.posterTheme,
                artist: {
                    artistId: bookmarkData.userId,
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

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_MYPAGE_BOOKMARK_SUCCESS, myBookmarkPostList));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 