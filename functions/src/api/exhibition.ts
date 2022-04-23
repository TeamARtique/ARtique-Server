import express from 'express';
import homeController from '../controller/exhibition/homeController';
import detailController from '../controller/exhibition/detailController';
import entireController from '../controller/exhibition/entireListController';
import editController from '../controller/exhibition/editController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('/main/:category', checkUser, homeController);
router.get('/:exhibitionId', checkUser, detailController);
router.get('/list/:category', checkUser, entireController);

router.put('/:exhibitionId', checkUser, editController);

module.exports = router;
