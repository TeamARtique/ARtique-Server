// const _ = require("lodash");

// ✅ 이메일로 유저 찾기
const findUserByEmail = async (client: any, email: string) => {
  const { rows } = await client.query(
    `
      SELECT id, email FROM "user"
      WHERE email = $1
      AND is_deleted = false
      `,
    [email],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 유저 생성
const createUser = async (
  client: any,        
  email: string,
  nickname: string,
  profileImage: string
) => {
  const { rows } = await client.query(
    `
      INSERT INTO "user"
      (email, nickname, profile_image ,introduction, website)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *
      `,

    [
      email,
      nickname,
      profileImage
    ],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
  findUserByEmail,
  createUser
}