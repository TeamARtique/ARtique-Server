import express from 'express';
import galleryController from '../controller/exhibition/galleryController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('/:exhibitionId', checkUser, galleryController);

module.exports = router;