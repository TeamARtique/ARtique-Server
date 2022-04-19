const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 전시 id에 기반한 북마크 수 가져오기
const getBookmarkCount = async (client: any, exhibitionId: number) => {
  const { rows } = await client.query(
    `
    SELECT count(b.*) as bookmark_count
    FROM "bookmark" b
    WHERE b.exhibition_id = $1
    AND b.is_deleted = false
    `,
    [exhibitionId]
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시 id, 유저 id에 기반한 북마크 여부 가져오기
const getIsBookmarked = async (client: any, exhibitionId: number, userId: number) => {
    const { rows } = await client.query(
    `
    SELECT count(b.*) as is_bookmarked
    FROM "bookmark" b
    WHERE b.exhibition_id = $1
    AND b.user_id = $2
    `,
    [exhibitionId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getBookmarkCount,
    getIsBookmarked
};
