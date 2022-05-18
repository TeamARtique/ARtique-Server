import { Request, Response } from "express";
import ticketService from "../../service/ticketService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /ticket/:exhibitionId
 *  @desc POST create ticketbook list (티켓북 생성) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let userId = req.body.user.id;
    let exhibitionId = parseInt(req.params.exhibitionId);

    try {
        client = await db.connect(req);
        let ticketExhibitionId = 0;
        let existiongTicket = await ticketService.checkTicketBookData(client, userId, exhibitionId);
        
        if (existiongTicket.length > 0) {
            let updateTicket = await ticketService.updateTicketBookData(client, userId, exhibitionId);
            ticketExhibitionId = updateTicket.exhibitionId;
        } else {
            let createTicket = await ticketService.createTicketBook(client, userId, exhibitionId);
            if (!createTicket) {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            } else {
                ticketExhibitionId = createTicket.exhibitionId;
            }
        }

        let mainData = {
            exhibitionId: ticketExhibitionId
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATE_TICKETBOOK_SUCCESS, mainData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 