import { Request, Response } from "express";
import exhibitionService from "../../service/exhibitionService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /exhibition/main/:category
 *  @desc GET Home exhibition list by category (카테고리별 홈 리스트 조회) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client;
    let category = parseInt(req.params.category);
    try {
        client = await db.connect(req);
        const categoryExhibitionList = await exhibitionService.getMainPostByCategory(client, category);

        let mainData = {
            forArtiExhibition: [],
            popularExhibition: [],
            categoryExhibition: [categoryExhibitionList]
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_MAIN_SUCCESS, mainData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 