import express from 'express';
import homeController from '../controller/exhibition/homeController';
import detailController from '../controller/exhibition/detailController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('/main/:category', checkUser, homeController);
router.get('/:exhibitionId', checkUser, detailController);

module.exports = router;
