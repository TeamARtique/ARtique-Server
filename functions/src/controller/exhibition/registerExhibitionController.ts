import exhibitionService from "../../service/exhibitionService";
import exhibitionDTO from "../../interface/req/exhibitionDTO";
import artworkService from '../../service/artworkService'
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route POST /exhibition/new
 *  @desc POST exhibition (전시 등록) 
 *  @access Private
 */
export default async (req: any, res: any) => {
    let client: any;
    let parameters = req.body;

    let user = req.body.user;
    if (parameters.gallerySize == null || parameters.galleryTheme == null || parameters.title == null || parameters.category == null || parameters.posterImage == null || parameters.posterOriginalImage == null || parameters.posterTheme == null || parameters.description == null || parameters.tag == null || parameters.isPublic == null || parameters.artworkImage == null || parameters.artworkTitle == null || parameters.artworkDescription == null) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }

    try {
        client = await db.connect(req);

        const exhibitionData: exhibitionDTO = {
            gallerySize: parameters.gallerySize,
            galleryTheme: parameters.galleryTheme,
            title: parameters.title,
            category: parameters.category,
            posterImage: parameters.posterImage,
            posterOriginalImage: parameters.posterOriginalImage,
            posterTheme: parameters.posterTheme,
            description: parameters.description,
            tag: parameters.tag,
            isPublic: parameters.isPublic,
            artworkImage: parameters.artworkImage,
            artworkTitle: parameters.artworkTitle,
            artworkDescription: parameters.artworkDescription
        };

        let artworkImageArray = exhibitionData.artworkImage as string[];
        let artworkTitleArray = exhibitionData.artworkTitle as string[];
        let artworkDescArray = exhibitionData.artworkDescription as string[];

        const uploadExhibitionData = await exhibitionService.createExhibitionNew(client, user.id, exhibitionData.gallerySize as number, exhibitionData.galleryTheme as number, exhibitionData);
        const artworksData = []
        for (let idx = 0; idx < artworkImageArray.length; idx++) {
            const uploadArtworkData = await artworkService.createArtwork(client, uploadExhibitionData.exhibitionId, artworkImageArray[idx], artworkTitleArray[idx], artworkDescArray[idx], idx + 1);
            artworksData.push(uploadArtworkData)
        }

        const finalData = {
            exhibition: {
                exhibitionId: uploadExhibitionData.exhibitionId,
                title: uploadExhibitionData.title,
                posterImage: uploadExhibitionData.posterImage,
                posterOriginalImage: uploadExhibitionData.posterOriginalImage,
                posterTheme: uploadExhibitionData.posterTheme,
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