import { Request, Response } from "express";
import ticketService from "../../service/ticketService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route DELETE /ticket/delete/:exhibitionId
 *  @desc POST delete ticketbooks (티켓북 삭제) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;
    let exhibitionId = parseInt(req.params.exhibitionId);

    try {
        client = await db.connect(req);
        let deleteTicket = await ticketService.deleteTicketBookData(client, userId, exhibitionId);

        console.log("delete", deleteTicket);
        if (deleteTicket.bool === true)  {
            console.log("티켓북 삭제 성공!!!")
            res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_TICKETBOOK_SUCCESS));
        }
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 