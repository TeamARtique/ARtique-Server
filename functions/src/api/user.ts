import express from 'express';
import deleteUserController from '../controller/mypage/deleteUserController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.post('/delete', checkUser, deleteUserController);

module.exports = router;
