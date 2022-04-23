const convertSnakeToCamel = require("../lib/convertSnakeToCamel");
import exhibitionDTO from '../interface/req/exhibitionDTO';

// ✅ 카테고리별 메인뷰 포스트 리스트 가져오기
const getMainExhibitionByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.id as exhibition_id, e.title, e.poster_image, e.poster_theme, e.created_at
    FROM "exhibition" e
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    ORDER BY e.created_at desc
    LIMIT 6
    `,
    [category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 메인뷰 인기 포스트 리스트 가져오기
const getMainPopularExhibitionByCategory = async (client: any, category: number, userId: number) => {
  const { rows } = await client.query(
    `
    SELECT e.id as exhibition_id, e.title, e.poster_image, e.poster_theme, count(l.exhibition_id) as like_count, count(DISTINCT l2.user_id) as is_liked, e.user_id, count(b.exhibition_id) as bookmark_count, count(DISTINCT b2.user_id) as is_bookmarked
    FROM "exhibition" e
    INNER JOIN "like" l
    ON e.id = l.exhibition_id
    LEFT OUTER JOIN "like" l2
    ON e.id = l2.exhibition_id
    AND l2.user_id = $2
    LEFT OUTER JOIN "bookmark" b
    ON e.id = b.exhibition_id
    LEFT OUTER JOIN "bookmark" b2
    ON e.id = b2.exhibition_id
    AND b2.user_id = $2
    WHERE e.category = $1
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY count(l.exhibition_id) DESC LIMIT 6
    `,
    [category, userId]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 포스트 전체 리스트 가져오기(최신순)
const getEntireCategoryExhibitionDefault = async (client: any, category: number, userId: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*, count(l.exhibition_id) as like_count, count(DISTINCT l2.user_id) as is_liked, e.user_id, count(b.exhibition_id) as bookmark_count, count(DISTINCT b2.user_id) as is_bookmarked
    FROM "exhibition" e
    LEFT OUTER JOIN "like" l
    ON e.id = l.exhibition_id
    LEFT OUTER JOIN "like" l2
    ON e.id = l2.exhibition_id
    AND l2.user_id = $2
    LEFT OUTER JOIN "bookmark" b
    ON e.id = b.exhibition_id
    LEFT OUTER JOIN "bookmark" b2
    ON e.id = b2.exhibition_id
    AND b2.user_id = $2
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY e.created_at DESC
    `,
    [category, userId]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 포스트 전체 리스트 가져오기(인기순)
const getEntireCategoryExhibitionByLike = async (client: any, category: number, userId: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*, count(l.exhibition_id) as like_count, count(DISTINCT l2.user_id) as is_liked, e.user_id, count(b.exhibition_id) as bookmark_count, count(DISTINCT b2.user_id) as is_bookmarked
    FROM "exhibition" e
    LEFT OUTER JOIN "like" l
    ON e.id = l.exhibition_id
    LEFT OUTER JOIN "like" l2
    ON e.id = l2.exhibition_id
    AND l2.user_id = $2
    LEFT OUTER JOIN "bookmark" b
    ON e.id = b.exhibition_id
    LEFT OUTER JOIN "bookmark" b2
    ON e.id = b2.exhibition_id
    AND b2.user_id = $2
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY count(l.exhibition_id) DESC 
    `,
    [category, userId]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 전시 상세조회
const getDetailExhibition = async (client: any, exhibitionid: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
    FROM "exhibition" e
    WHERE e.id = $1
    `,
    [exhibitionid]
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시 상세 수정
const putEditDetailExhibition = async (client: any, exhibitionId: number, exhibition: exhibitionDTO) => {
  const { rows } = await client.query(
    `
    UPDATE exhibition e
    SET title = $2, 
        category = $3, 
        poster_image = $4, 
        poster_theme = $5, 
        description = $6,
        tag = ARRAY[${exhibition.tag}], 
        is_public = $7
    WHERE e.id = $1
    RETURNING *
    `,
    [exhibitionId, exhibition.title, exhibition.category, exhibition.posterImage, exhibition.posterTheme, exhibition.description, exhibition.isPublic]
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시 삭제
const deleteExhibition = async (client: any, exhibitionId: number) => {
  const { rows } = await client.query(
    `
    UPDATE exhibition e
    SET is_deleted = true, updated_at = now()
    WHERE e.id = $1
    RETURNING id as exhibition_id, is_deleted
    `,
    [exhibitionId]
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
  getMainExhibitionByCategory,
  getMainPopularExhibitionByCategory,
  getEntireCategoryExhibitionDefault,
  getEntireCategoryExhibitionByLike,
  getDetailExhibition,
  putEditDetailExhibition,
  deleteExhibition,
};
