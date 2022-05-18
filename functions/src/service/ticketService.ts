const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 티켓북 리스트 조회
const getTicketBookData = async (client: any, userId: number) => {
    const { rows } = await client.query(
        `
        SELECT u.*, count(e.id) as exhibition_count, count(t.exhibition_id) as ticket_count
        FROM "user" u
        LEFT OUTER JOIN "exhibition" e
        ON e.user_id = u.id
        AND e.is_deleted = false
        LEFT OUTER JOIN "ticket" t
        ON t.user_id = u.id
        AND t.exhibition_id = e.id
        AND t.is_deleted = false
        WHERE u.id = $1
        GROUP BY u.id
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 티켓북 생성
const createTicketBook = async (client: any, userId: number, exhibitionId: number) => {
    const { rows } = await client.query(
        `
        INSERT INTO "ticket"
        (user_id, exhibition_id)
        VALUES
        ($1, $2)
        RETURNING exhibition_id
        `,
        [userId, exhibitionId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 티켓북 존재여부 조회
const checkTicketBookData = async (client: any, userId: number, exhibitionId: number) => {
    const { rows } = await client.query(
        `
        SELECT t.*
        FROM "ticket" t
        WHERE user_id = $1 AND exhibition_id = $2
        `,
        [userId, exhibitionId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 티켓북 생성날짜 업데이트
const updateTicketBookData = async (client: any, userId: number, exhibitionId: number) => {
    const { rows } = await client.query(
        `
        UPDATE "ticket" t
        SET updated_at = now()
        WHERE t.user_id = $1 AND t.exhibition_id = $2
        RETURNING exhibition_id
        `,
        [userId, exhibitionId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getTicketBookData,
    createTicketBook,
    checkTicketBookData,
    updateTicketBookData,
};
