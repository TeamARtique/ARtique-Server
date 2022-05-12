import express from 'express';
import homeController from '../controller/exhibition/homeController';
import detailController from '../controller/exhibition/detailController';
import entireController from '../controller/exhibition/entireListController';
import editController from '../controller/exhibition/editController';
import deleteController from '../controller/exhibition/deleteController';
import uploadController from '../controller/exhibition/uploadController';
const { checkUser } = require("../middleware/auth");
const { uploadImage } = require("../middleware/uploadImage")
const router = express.Router();

/* [GET] */
router.get('/main/:category', checkUser, homeController);
router.get('/:exhibitionId', checkUser, detailController);
router.get('/list/:category', checkUser, entireController);

/* [POST] */
router.post('/', checkUser, uploadImage, uploadController);

/* [PUT] */
router.put('/:exhibitionId', checkUser, editController);

/* [DELETE] */
router.delete('/:exhibitionId', checkUser, deleteController);

module.exports = router;
