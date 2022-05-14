import express from 'express';
import mypageController from '../controller/mypage/mypageController';
import myEntireBookmarkController from '../controller/mypage/myEntireBookmarkController';
import myEntireExhibitionController from '../controller/mypage/myEntireExhibitionController';
import editProfileController from '../controller/mypage/editProfileController';
const { checkUser } = require("../middleware/auth");
const { uploadProfileImage } = require("../middleware/uploadProfileImage")
const router = express.Router();

/* [GET] */
router.get('', checkUser, mypageController);
router.get('/bookmark', checkUser, myEntireBookmarkController);
router.get('/exhibition', checkUser, myEntireExhibitionController);

/* [PUT] */
router.put('/profile', checkUser, uploadProfileImage, editProfileController);

module.exports = router;
