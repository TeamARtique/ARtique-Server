const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

// ✅ 카테고리별 메인뷰 포스트 리스트 가져오기
const getMainPostByCategory = async (client: any, category: number) => {
  const { rows } = await client.query(
    `
      SELECT u.*
      FROM "user" u
      WHERE u.id = $1
      AND is_deleted = false
      `,
    [category],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getMainPostByCategory,
}