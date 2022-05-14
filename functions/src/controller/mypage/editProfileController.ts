import userService from "../../service/userService";
import userProfileDTO from '../../interface/req/userProfileDTO';
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route PUT /mypage/profile
 *  @desc PUT edit user data (유저의 프로필(정보) 수정)
 *  @access Private
 */
export default async (req: any, res: any) => {
    let client: any;
    let userId = req.body.user.id;
    let fields = req.body.fields;
    let profileImage = req.body.imageUrls;
    if (!userId || !fields['nickname']) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }

    console.log(profileImage);

    if (profileImage.length == 0) {
        profileImage.push("https://firebasestorage.googleapis.com/v0/b/artique-34e8e.appspot.com/o/ARtique_default%2Farti_default.png?alt=media&token=07648fa7-da95-4381-b7fd-580e47eeec1f");
    }

    // body
    const exhibitionData: userProfileDTO = {
        profileImage: profileImage[0],
        nickname: fields['nickname'], 
        introduction: fields['introduction'],
        website: fields['website']
    };
    
    try {
        client = await db.connect(req);
        const userEditData = await userService.updateUser(client, userId, exhibitionData);
        if (!userEditData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }

        let userProfileData = {
            user: {
                nickname: userEditData.nickname,
                profileImage: userEditData.profileImage,
                introduction: userEditData.introduction,
                website: userEditData.website
            }
        }
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.USER_PROFILE_UPDATE_SUCCESS, userProfileData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 