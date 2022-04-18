const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 카테고리별 메인뷰 포스트 리스트 가져오기
const getMainPostByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
    SELECT e.id as exhibition_id, e.title, e.poster_image, e.poster_theme, e.created_at
    FROM "exhibition" e
    WHERE e.category = $1
    AND e.is_deleted = false
    ORDER BY e.created_at desc
    LIMIT 6
    `,
    [category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

export default {
  getMainPostByCategory,
};
