const functions = require('firebase-functions');
const { Pool, Query } = require('pg');
const dayjs = require('dayjs');
import dotenv from "dotenv"
dotenv.config();

const dbConfig = require('../config/dbConfig');

let devMode = process.env.NODE_ENV === 'development';

const sqlDebug = true;

const submit = Query.prototype.submit;
Query.prototype.submit = function() {
    const text = this.text;
    const values = this.values || [];
    const query = text.replace(/\$([0-9]+)/g, (m: any, v: any) =>
    JSON.stringify(values[parseInt(v) - 1]));
    devMode && sqlDebug && console.log(`\n\n[SQL
    STATEMENT]\n${query}\n________\n`);
    submit.apply(this, arguments);
};

console.log(`[DB] ${process.env.NODE_ENV}`);

const pool = new Pool({
    ...dbConfig,
    connectionTimeoutMillis: 60 * 1000,
    idleTimeoutMillis: 60 * 1000,
});

const connect = async (req: Request) => {
    console.log("connect");
    const now = dayjs();
    const callStack = new Error().stack;
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    const releaseChecker = setTimeout(() => {
        devMode
        ? console.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack })
        : functions.logger.console.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack });
        devMode ? console.error(`마지막으로 실행된 쿼리문입니다. ${ client.lastQuery }`) :
        functions.logger.error(`마지막으로 실행된 쿼리문입니다. ${ client.lastQuery }`);
    }, 15 * 1000);

    client.query = (...args: any[]) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };
    client.release = () => {
        clearTimeout(releaseChecker);
        const time = dayjs().diff(now, 'millisecond');
        if (time > 4000) {
            const message = `[RELEASE] in ${time}`;
            devMode && console.log(message);
        }
        client.query = query;
        client.release = release;
        return release.apply(client);
    };
    return client;
};

module.exports = {
    connect,
};