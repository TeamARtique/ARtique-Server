import express from 'express';
import ticketController from '../controller/ticket/ticketController';
import createTicketController from '../controller/ticket/createTicketController';
import deleteTicketController from '../controller/ticket/deleteTicketController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/', checkUser, ticketController);

/* [POST] */
router.post('/:exhibitionId', checkUser, createTicketController);

/* [DELETE] */
router.delete('/delete/:exhibitionId', checkUser, deleteTicketController);

module.exports = router;
