import express from 'express';
import mainController from '../controller/exhibition/mainController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

router.get('/main/:category', checkUser, mainController);

module.exports = router;
