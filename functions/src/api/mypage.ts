import express from 'express';
import mypageController from '../controller/mypage/mypageController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('', checkUser, mypageController);

module.exports = router;
