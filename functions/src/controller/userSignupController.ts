import { Request, Response } from 'express';
const responseMessage = require("../constants/responseMessage");
const statusCode = require("../constants/statusCode");
const util = require("../lib/util")

const users = require("../dbMockup/user");

export default async (req: Request, res: Response) => {
    // destructuring assignment
    // 비구조화 할당
    const email: string = req.body.email;
    const name: string = req.body.name;
    const password: string = req.body.password;

    // request body가 잘못됐을 때
    if (!email || !name || !password) {
        res
        .status(statusCode.BAD_REQUEST)
        .send(
            util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE),
        );
    }

    // 해당 email을 가진 유저가 이미 있을 때
    const alreadyUser = users.filter((obj: any) => obj.email === email).length > 0;
    if (alreadyUser) {
        res
        .status(statusCode.BAD_REQUEST)
        .send(
            util.fail(
                statusCode.BAD_REQUEST,
                responseMessage.ALREADY_EMAIL,
            ),
        );
    }

    const newUser = {
        id: users.length + 1,
        name,
        password,
        email,
    };

    res.status(statusCode.OK).send(
        util.success(statusCode.OK, responseMessage.CREATED_USER, newUser),
    );
};