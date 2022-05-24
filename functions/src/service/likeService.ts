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

// ✅ 유저의 좋아요 정보 가져오기
const getIsLiked = async (client: any, exhibitionId: number, userId: number) => {
    const { rows } = await client.query(
    `
    SELECT count(l.*) as is_liked
    FROM "like" l
    WHERE l.exhibition_id = $1
    AND l.user_id = $2
    AND l.is_deleted = false
    `,
    [exhibitionId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시id 기반 좋아요 정보 가져오기
const getLikeByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
        SELECT * FROM "like"
        WHERE exhibition_id = $1
        AND user_id = $2
        `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 좋아요 생성
const createLikeByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
    INSERT INTO "like"
    (exhibition_id, user_id)
    VALUES
    ($1, $2)
    RETURNING exhibition_id, is_deleted as is_liked
    `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 좋아요 업데이트
const updateLikeByExhibitionId = async (client: any, exhibitionId: number, userId: number) => {
  const { rows } = await client.query(
    `
    UPDATE "like"
    SET updated_at = now(), is_deleted = CASE
    WHEN is_deleted = true THEN false
    ELSE true
    END
    WHERE exhibition_id = $1
    AND user_id = $2
    RETURNING exhibition_id, is_deleted as is_liked
    `,
    [exhibitionId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};


// ✅ 좋아요 삭제(회원 탈퇴시)
const deleteLikeByUserId = async (client: any, userId: number) => {
  const { rows } = await client.query(
    `
    UPDATE "like" l
    SET is_deleted = true, updated_at = now()
    WHERE l.user_id = $1
    RETURNING is_deleted
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getLikeCount,
    getIsLiked,
    getLikeByExhibitionId,
    createLikeByExhibitionId,
    updateLikeByExhibitionId,
    deleteLikeByUserId,
};
