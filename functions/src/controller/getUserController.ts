import { Request, Response } from 'express';
import functions from 'firebase-functions';
const responseMessage = require("../constants/responseMessage");
const statusCode = require("../constants/statusCode");
const util = require("../lib/util");
const db = require('../db/db');
const { userDB } = require('../db');

export default async (req: Request, res: Response) => {
    console.log("오긴온다야.");
    let client;
    try {
        client = await db.connect(req);
        const users = await userDB.getAllUsers(client);
        console.log("hi");
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_USERS_SUCCESS, users));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
};