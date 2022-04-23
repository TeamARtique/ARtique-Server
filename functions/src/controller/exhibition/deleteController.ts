import { Request, Response } from "express";
import exhibitionService from "../../service/exhibitionService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route DELETE /exhibition/:exhibitionId
 *  @desc DELETE delete exhibition detail data (전시글 삭제) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    if (!exhibitionId || !userId) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    try {
        client = await db.connect(req);
        const exhibitionEditData = await exhibitionService.deleteExhibition(client, exhibitionId);
        if (!exhibitionEditData) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_DELETE_SUCCESS, exhibitionEditData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 