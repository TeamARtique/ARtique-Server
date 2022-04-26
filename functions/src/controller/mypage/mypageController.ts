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
 *  @route GET /mypage
 *  @desc GET mypage data (마이페이지 조회)
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;

    try {
        client = await db.connect(req);
        let userData = await mypageService.getMypageUserData(client, userId);
        let myExhibitionData = await mypageService.getMyExhibitionData(client, userId);
        let myBookmarkedData = await mypageService.getMyBookmarkedData(client, userId);

        if (!userData || !myExhibitionData || !myBookmarkedData) {
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

        let mypageData = {
            user: {
                nickname: userData.nickname,
                profileImage: userData.profileImage,
                introduction: userData.introduction,
                website: userData.website,
                exhibitionCount: userData.exhibitionCount,
                ticketCount: userData.ticketCount
            },
            myExhibition: myExhibitionPostList,
            myBookmarkedData: myBookmarkPostList
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_MYPAGE_SUCCESS, mypageData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 