import exhibitionService from "../../service/exhibitionService";
import artworkService from "../../service/artworkService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /exhibition/create/success/:exhibitionId
 *  @desc POST exhibition (전시 등록 성공여부 체크) 
 *  @access Private
 */
export default async (req: any, res: any) => {
    let client: any;
    let exhibitionId = req.params.exhibitionId;
    if (!exhibitionId) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }
    
    function isDup(arr: any)  {
        return arr.some(function(x: any) {
            return arr.indexOf(x) !== arr.lastIndexOf(x);
        });  
    }

    try {
        client = await db.connect(req);
        const exhibitionDetailData = await exhibitionService.getDetailExhibition(client, exhibitionId);
        const artworkData = await artworkService.getArtworks(client, exhibitionId);

        if (exhibitionDetailData.gallerySize != artworkData.length) {
            await exhibitionService.deleteExhibition(client, exhibitionId);
            await artworkService.deleteArtworks(client, exhibitionId);
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, "전시회 생성에 실패하였습니다. 다시 시도해주세요"));
        } else {
            // 인덱스 검사
            let indexArr = [];
            for (const pl of artworkData) {
                indexArr.push(pl.index);
            }
            let result = isDup(indexArr);
            if (result == true) {
                // 중복되는 Index가 있을 경우
                await exhibitionService.deleteExhibition(client, exhibitionId);
                await artworkService.deleteArtworks(client, exhibitionId);
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, "전시회 생성에 실패하였습니다. 다시 시도해주세요"));
            } else {
                res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_CREATE_SUCCESS));
            }
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