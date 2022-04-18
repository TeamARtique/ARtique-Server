import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import serviceAccount from '../artique-34e8e-firebase-adminsdk-3hbqi-4f652b5de4.json';
import dotenv = require('dotenv'); 

// 보안 상 깃허브에 올리면 안되는 정보를 .env라는 파일로 관리하기 위해 사용되는 모듈
dotenv.config();

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
} else {
    admin.app();
}

// 각종 모듈들
import express = require('express');
import { Request, Response, NextFunction } from 'express';
import cors = require('cors');
// const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const helmet = require('helmet');

// initializing
const app = express();

// Cross-Origin Resource Sharing을 열어주는 미들웨어
app.use(cors());

// 보안을 위한 미들웨어들
// process.env.NODE_ENV는 배포된 서버에서는 'production'으로, 로컬에서 돌아가는 서버에서는 'development'로 고정됨.
if (process.env.NODE_ENV === "production") {
    app.use(hpp());
    app.use(helmet());
}

// request에 담긴 정보를 json형태로 파싱하기 위한 미들웨어들
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 라우팅
app.use("/auth", require("./api/auth"));
app.use("/exhibition", require("./api/exhibition"));

// route 폴더에 우리가 지정한 경로가 아닌 다른 경로로 요청이 올 경우,
// 잘못된 경로로 요청이 들어왔다는 메시지를 클라이언트에 보냄
app.use("*", function (err: any, req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
        status: 404,
        success: false,
        message: "잘못된 경로입니다.",
    });
});

export const server = functions
.runWith({ timeoutSeconds: 300, memory: "512MB" })
.region('asia-northeast3')
.https.onRequest((request: functions.Request, response: functions.Response) => {
    console.log("\n\n", "[api]", `[${request.method.toUpperCase()}]`, request.originalUrl, request.body);
    return app(request, response);
});
