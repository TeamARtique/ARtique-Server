import express from 'express';
import homeController from '../controller/exhibition/homeController';
import detailController from '../controller/exhibition/detailController';
import entireController from '../controller/exhibition/entireListController';
import editController from '../controller/exhibition/editController';
import deleteController from '../controller/exhibition/deleteController';
import exhibitionUploadController from '../controller/exhibition/exhibitionUploadController';
import artworkUploadController from '../controller/exhibition/artworkUploadController';
import uploadCheckontroller from '../controller/exhibition/createCheckController';
const { checkUser } = require("../middleware/auth");
const { uploadImage } = require("../middleware/uploadImage")
const router = express.Router();

/* [GET] */
router.get('/main/:category', checkUser, homeController);
router.get('/:exhibitionId', checkUser, detailController);
router.get('/list/:category', checkUser, entireController);
router.get('/create/success/:exhibitionId', checkUser, uploadCheckontroller);

/* [POST] */
router.post('/', checkUser, uploadImage, exhibitionUploadController);
router.post('/artwork/:exhibitionId', checkUser, uploadImage, artworkUploadController);

/* [PUT] */
router.put('/:exhibitionId', checkUser, editController);

/* [DELETE] */
router.delete('/:exhibitionId', checkUser, deleteController);

module.exports = router;
