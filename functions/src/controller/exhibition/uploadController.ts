import exhibitionService from "../../service/exhibitionService";
import exhibitionDTO from '../../interface/req/exhibitionDTO';
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /exhibition
 *  @desc POST exhibition (전시 등록) 
 *  @access Private
 */
export default async (req: any, res: any) => {
    let client: any;
    let fields = req.body.fields;
    let artworks = req.body.imageUrls;
    let user = req.body.user;

    try {
        client = await db.connect(req);

        const exhibitionData: exhibitionDTO = {
            title: fields['title'],
            category: fields['category'] as number, 
            posterImage: artworks[artworks.length - 1],
            description: fields['description'],
            tag: fields['tag'],
            isPublic: fields['isPublic'] as boolean
        };

        const uploadExhibitionData = await exhibitionService.createExhibition(client, user.id, fields['gallerySize'] as number, fields['galleryTheme'] as number, exhibitionData);
        
        // const uploadArtworkData = await artworkService.createArtwork()
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_MAIN_SUCCESS, uploadExhibitionData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 