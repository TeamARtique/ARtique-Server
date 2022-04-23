const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

// ✅ 전시회 각각의 전시품(사진, 제목, 설명)을 조회
const getArtworks = async (client: any, exhibitionid: number) => {
  const { rows } = await client.query(
    `
    SELECT a.id as artwork_id, a.image, a.title, a.description
    FROM "artwork" a
    WHERE a.exhibition_id = $1
    `,
    [exhibitionid]
  );
  console.log("artwork result::", convertSnakeToCamel.keysToCamel(rows));
  return convertSnakeToCamel.keysToCamel(rows);
};

export default {
    getArtworks,
};
