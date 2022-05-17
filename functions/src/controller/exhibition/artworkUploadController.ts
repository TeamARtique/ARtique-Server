import artworkService from '../../service/artworkService'
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /exhibition/artwork/:exhibitionId
 *  @desc POST exhibition artwork (전시 등록 2) 
 *  @access Private
 */
export default async (req: any, res: any) => {
    let client: any;
    let fields = req.body.fields;
    let artworks = req.body.imageUrls;
    let exhbitionId = req.params.exhibitionId;
    if (!exhbitionId || !artworks[0] || !fields['index']) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }

    try {
        client = await db.connect(req);
        const uploadArtworkData = await artworkService.createArtwork(client, exhbitionId, artworks[0], fields['title'], fields['description'], fields['index']);

        const finalData = {
            exhibitionId: uploadArtworkData.exhibitionId,
            artworkId: uploadArtworkData.artworkId,
            image: uploadArtworkData.image,
            title: uploadArtworkData.title,
            description: uploadArtworkData.description,
			index: uploadArtworkData.index
        }
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.EXHIBITION_CREATE_SUCCESS, finalData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 