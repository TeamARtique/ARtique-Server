import { NextFunction } from "express";
const admin = require("firebase-admin");
const functions = require("firebase-functions");
import BusBoy from "busboy";
const path = require("path");
const os = require("os");
const fs = require("fs");
const dayjs = require("dayjs");
const { firebaseConfig } = require("../config/firebaseConfig");
const util = require("../lib/util");
const statusCode = require("../constants/statusCode");
const responseMessage = require("../constants/responseMessage");

const uploadImage = async (req: any, res: any, next: NextFunction) => {
    const busboy = BusBoy({ headers: req.headers });
    let imageFileName: any = {};
    let imagesToUpload: any = [];
    let imageToAdd: any = {};
    let imageUrls: any = [];
    let fields: any = {};

    // req.body로 들어오는 key:value 페어들을 처리
    busboy.on('field', (fieldname: string, val: string, info: BusBoy.FieldInfo) => {
        fields[fieldname] = val;
    });

    // req.body로 들어오는 게 파일일 경우 처리
    busboy.on("file", (name: any, file: any, info: any) => {
        const { filename, mimeType } = info;
        if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
            return res.status(400).json({ error: "Wrong file type submitted" });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // 32756238461724837.png
        imageFileName = `${dayjs().format("YYYYMMDD_HHmmss_")}${Math.round(
            Math.random() * 1000000000000,
        ).toString()}.${imageExtension}`;

        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToAdd = { imageFileName, filepath, mimeType };
        file.pipe(fs.createWriteStream(filepath));
        imagesToUpload.push(imageToAdd);

        file.on('error', function(err: any) {
            console.log("error:", err);
        })
        return;
    });

    // req.body로 들어온 파일들을 Firebase Storage에 업로드
    busboy.on("finish", async () => {
        let promises: any = [];
        imagesToUpload.forEach((imageToBeUploaded: any) => {
        imageUrls.push(
            `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageToBeUploaded.imageFileName}?alt=media`,
        );
        promises.push(
            admin
            .storage()
            .bucket(firebaseConfig.storageBucket)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                    },
                },
            }),
            );
        });
        try {
            await Promise.all(promises);
                req.body.fields = fields;
                req.body.imageUrls = imageUrls;
                next();
                return;
        } catch (err) {
            console.error(err);
            functions.logger.error(
                `[FILE UPLOAD ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`,
            );
            return res
                .status(500)
                .json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
    });
    busboy.end(req.rawBody);  
};  

module.exports = { uploadImage };
