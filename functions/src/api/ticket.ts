import express from 'express';
import homeController from '../controller/exhibition/homeController';
import createTicketController from '../controller/ticket/createTicketController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/', checkUser, homeController);

/* [POST] */
router.post('/:exhibitionId', checkUser, createTicketController);

module.exports = router;
