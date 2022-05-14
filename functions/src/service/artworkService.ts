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

// ✅ 전시작품 생성
const createArtwork = async (
  client: any,        
  exhibitionId: number,
  image: string,
  title: string,
  description: string
) => {
  const { rows } = await client.query(
    `
      INSERT INTO "artwork"
      (exhibition_id, image, title, description)
      VALUES
      ($1, $2, $3, $4)
      RETURNING id as artwork_id, image, title, description
      `,
    [
      exhibitionId,
      image,
      title,
      description
    ],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
    getArtworks,
    createArtwork,
};
