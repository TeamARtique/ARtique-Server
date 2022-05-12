import express from 'express';
import likeController from '../controller/like&bookmark/likeController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/:exhibitionId', checkUser, likeController);

module.exports = router;
