import express from 'express';
import mypageController from '../controller/mypage/mypageController';
import myEntireBookmarkController from '../controller/mypage/myEntireBookmarkController';
import myEntireExhibitionController from '../controller/mypage/myEntireExhibitionController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('', checkUser, mypageController);
router.get('/bookmark', checkUser, myEntireBookmarkController);
router.get('/exhibition', checkUser, myEntireExhibitionController);

module.exports = router;
