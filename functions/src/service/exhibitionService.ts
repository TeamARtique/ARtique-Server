const convertSnakeToCamel = require("../lib/convertSnakeToCamel");
import exhibitionDTO from '../interface/req/exhibitionDTO';

// ✅ 카테고리별 메인뷰 포스트 리스트 가져오기
const getMainExhibitionByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
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
const getMainPopularExhibitionByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
    FROM "exhibition" e
    INNER JOIN "like" l
    ON e.id = l.exhibition_id
    AND l.is_deleted = false
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY count(l.exhibition_id) DESC LIMIT 6
    `,
    [category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 메인뷰 ~를 위한 포스트 리스트 가져오기
const getMainForExhibitionByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
    FROM "exhibition" e
    INNER JOIN "like" l
    ON e.id = l.exhibition_id
    AND l.is_deleted = false
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY count(l.exhibition_id) ASC LIMIT 6
    `,
    [category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 포스트 전체 리스트 가져오기(최신순)
const getEntireCategoryExhibitionDefault = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
    FROM "exhibition" e
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY e.created_at DESC
    `,
    [category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// ✅ 카테고리별 포스트 전체 리스트 가져오기(인기순)
const getEntireCategoryExhibitionByLike = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.*
    FROM "exhibition" e
    LEFT OUTER JOIN "like" l
    ON e.id = l.exhibition_id
    AND l.is_deleted = false
    WHERE e.category = $1
    AND e.is_public = true
    AND e.is_deleted = false
    GROUP BY e.id ORDER BY count(l.exhibition_id) DESC 
    `,
    [category]
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
    AND e.is_deleted = false
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
        poster_original_image = $5,
        poster_theme = $6,
        description = $7,
        tag = $8,
        is_public = $9
    WHERE e.id = $1
    RETURNING *
    `,
    [exhibitionId, exhibition.title, exhibition.category, exhibition.posterImage, exhibition.posterOriginalImage, exhibition.posterTheme, exhibition.description, exhibition.tag, exhibition.isPublic]
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

// ✅ 전시 삭제(회원 탈퇴시)
const deleteExhibitionByUserId = async (client: any, userId: number) => {
  const { rows } = await client.query(
    `
    UPDATE "exhibition" e
    SET is_deleted = true, updated_at = now()
    WHERE e.user_id = $1
    RETURNING true
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시 생성
const createExhibition = async (
  client: any,        
  userId: string,
  gallerySize: number,
  galleryTheme: number,
  exhibition: exhibitionDTO
) => {
  const { rows } = await client.query(
    `
      INSERT INTO "exhibition"
      (user_id, gallery_size, theme, title, category, poster_image, description, tag, is_public)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, ARRAY${exhibition.tag}, $8)
      RETURNING id as exhibition_id, gallery_size, theme, title, category, poster_image, description, tag, is_public, created_at, is_deleted
      `,
    [
      userId,
      gallerySize,
      galleryTheme,
      exhibition.title,
      exhibition.category,
      exhibition.posterImage,
      exhibition.description,
      exhibition.isPublic
    ],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 전시 생성
const createExhibitionNew = async (
  client: any,        
  userId: string,
  gallerySize: number,
  galleryTheme: number,
  exhibition: exhibitionDTO
) => {
  const { rows } = await client.query(
    `
      INSERT INTO "exhibition"
      (user_id, gallery_size, theme, title, category, poster_image, poster_original_image, poster_theme, description, tag, is_public)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id as exhibition_id, gallery_size, theme, title, category, poster_image, poster_original_image, poster_theme, description, tag, is_public, created_at, is_deleted
      `,
    [
      userId,
      gallerySize,
      galleryTheme,
      exhibition.title,
      exhibition.category,
      exhibition.posterImage,
      exhibition.posterOriginalImage,
      exhibition.posterTheme,
      exhibition.description,
      exhibition.tag,
      exhibition.isPublic
    ],
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
  deleteExhibitionByUserId,
  createExhibition,
  createExhibitionNew,
  getMainForExhibitionByCategory,
};
