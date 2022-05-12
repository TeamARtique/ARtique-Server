import express from 'express';
import bookmarkController from '../controller/like&bookmark/bookmarkController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/:exhibitionId', checkUser, bookmarkController);

module.exports = router;
