import exhibitionService from "../../service/exhibitionService";
import exhibitionDTO from '../../interface/req/exhibitionDTO';
import artworkService from '../../service/artworkService'
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
    let artworkTitles = req.body.fields.artworkTitle;
    let artworkDescriptions = req.body.fields.artworkDescription;
    let artworks = req.body.imageUrls;
    let user = req.body.user;
    if (!fields['title'] || !fields['category'] || !artworks[artworks.length - 1] || !fields['description'] || !artworkTitles || !artworkDescriptions || !fields['tag'] || !fields['isPublic'] || !fields['gallerySize'] || !fields['galleryTheme']) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }

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
        const artworksData = []
        for (let idx = 0; idx < artworkTitles.length; idx++) {
            const uploadArtworkData = await artworkService.createArtwork(client, uploadExhibitionData.exhibitionId, artworks[idx], artworkTitles[idx], artworkDescriptions[idx]);
            artworksData.push(uploadArtworkData)
        }

        const finalData = {
            exhibition: {
                exhibitionId: uploadExhibitionData.exhibitionId,
                title: uploadExhibitionData.title,
                posterImage: uploadExhibitionData.posterImage,
                description: uploadExhibitionData.description,
                tag: uploadExhibitionData.tag,
                category: uploadExhibitionData.category,
                gallerySize: uploadExhibitionData.gallerySize,
                galleryTheme: uploadExhibitionData.galleryTheme,
                isPublic: uploadExhibitionData.isPublic,
                createdAt: uploadExhibitionData.createdAt
            },
            artworks: artworksData
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