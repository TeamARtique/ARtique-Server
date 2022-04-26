const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 마이페이지 유저 정보 가져오기
const getMypageUserData = async (client: any, userId: number) => {
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
    console.log(convertSnakeToCamel.keysToCamel(rows[0]));
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 마이페이지 등록한 전시 데이터 가져오기 - 최대 6개
const getMyExhibitionData = async (client: any, userId: number) => {
    const { rows } = await client.query(
        `
        SELECT e.*
        FROM "exhibition" e
        WHERE e.user_id = $1
        AND e.is_deleted = false
        ORDER BY e.created_at desc
        LIMIT 6
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 마이페이지 북마크한 전시 데이터 가져오기 - 최대 6개
const getMyBookmarkedData = async (client: any, userId: number) => {
    const { rows } = await client.query(
        `
        SELECT e.*
        FROM "exhibition" e
        LEFT JOIN "bookmark" b
        ON e.id = b.exhibition_id
        AND b.user_id = $1
        AND b.is_deleted = false
        AND e.is_deleted = false
        AND e.is_public = true
        ORDER BY b.updated_at desc
        LIMIT 6
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};


// ✅ 마이페이지 등록한 전시 데이터 전체 리스트 가져오기
const getMyEntireExhibitionData = async (client: any, userId: number) => {
    const { rows } = await client.query(
        `
        SELECT e.*
        FROM "exhibition" e
        WHERE e.user_id = $1
        AND e.is_deleted = false
        ORDER BY e.created_at desc
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 마이페이지 북마크한 전시 데이터 전체 리스트 가져오기
const getMyEntireBookmarkedData = async (client: any, userId: number) => {
    const { rows } = await client.query(
        `
        SELECT e.*
        FROM "exhibition" e
        LEFT JOIN "bookmark" b
        ON e.id = b.exhibition_id
        AND b.user_id = $1
        AND b.is_deleted = false
        AND e.is_deleted = false
        AND e.is_public = true
        ORDER BY b.updated_at desc
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

export default {
    getMypageUserData,
    getMyExhibitionData,
    getMyBookmarkedData,
    getMyEntireExhibitionData,
    getMyEntireBookmarkedData
};
