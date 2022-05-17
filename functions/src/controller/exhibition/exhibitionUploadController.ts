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
    let posterImage = req.body.imageUrls;
    let user = req.body.user;
    if (!fields['gallerySize'] || !fields['galleryTheme'] || !fields['title'] || !fields['category'] || !fields['description'] || !posterImage[0] || !fields['tag'] || !fields['isPublic']) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        return;
    }

    try {
        client = await db.connect(req);

        const exhibitionData: exhibitionDTO = {
            title: fields['title'],
            category: fields['category'] as number, 
            posterImage: posterImage[0],
            description: fields['description'],
            tag: fields['tag'],
            isPublic: fields['isPublic'] as boolean
        };

        console.log(fields);
        const uploadExhibitionData = await exhibitionService.createExhibition(client, user.id, fields['gallerySize'] as number, fields['galleryTheme'] as number, exhibitionData);

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
            }
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