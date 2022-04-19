const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 카테고리별 메인뷰 포스트 리스트 가져오기
const getLikeCount = async (client: any, exhibitionId: number) => {
  const { rows } = await client.query(
    `
    SELECT count(l.*) as like_count
    FROM "like" l
    WHERE l.exhibition_id = $1
    AND l.is_deleted = false
    `,
    [exhibitionId]
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getIsLiked = async (client: any, exhibitionId: number, userId: number) => {
    const { rows } = await client.query(
    `
    SELECT count(l.*) as is_liked
    FROM "like" l
    WHERE l.exhibition_id = $1
    AND l.user_id = $2
    `,
    [exhibitionId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getLikeCount,
    getIsLiked
};
