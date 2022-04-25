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
    AND b.is_deleted = false
    `,
    [exhibitionId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시id 기반 북마크 정보 가져오기
const getBookmarkByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
        SELECT * FROM "bookmark"
        WHERE exhibition_id = $1
        AND user_id = $2
        `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 북마크 생성
const createBookmarkByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
    INSERT INTO "bookmark"
    (exhibition_id, user_id)
    VALUES
    ($1, $2)
    RETURNING exhibition_id, is_deleted as is_liked
    `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 북마크 업데이트
const updateBookmarkByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
    UPDATE "bookmark"
    SET updated_at = now(), is_deleted = CASE
    WHEN is_deleted = true THEN false
    ELSE true
    END
    WHERE exhibition_id = $1
    AND user_id = $2
    RETURNING exhibition_id, is_deleted as is_bookmarked
    `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getBookmarkCount,
    getIsBookmarked,
    getBookmarkByExhibitionId,
    createBookmarkByExhibitionId,
    updateBookmarkByExhibitionId,
};
