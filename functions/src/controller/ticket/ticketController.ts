import { Request, Response } from "express";
import ticketService from "../../service/ticketService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /ticket
 *  @desc GET ticketbook list (티켓북 조회) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;
    try {
        client = await db.connect(req);
        let ticketbookData = await ticketService.getTicketBookData(client, userId);
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_TICKETBOOK_SUCCESS, ticketbookData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 