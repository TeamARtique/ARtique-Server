import express from 'express';
import ticketController from '../controller/ticket/ticketController';
import createTicketController from '../controller/ticket/createTicketController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/', checkUser, ticketController);

/* [POST] */
router.post('/:exhibitionId', checkUser, createTicketController);

module.exports = router;
