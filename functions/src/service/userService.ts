// const _ = require("lodash");
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

// ✅ 아이디값으로 유저 찾기
const findUserById = async (client: any, userId: number) => {
  const { rows } = await client.query(
    `
      SELECT u.*
      FROM "user" u
      WHERE u.id = $1
      AND is_deleted = false
      `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 이메일로 유저 찾기
const findUserByEmail = async (client: any, email: string) => {
  const { rows } = await client.query(
    `
      SELECT id as user_id, email, nickname FROM "user"
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
      (email, nickname, profile_image)
      VALUES
      ($1, $2, $3)
      RETURNING id as user_id, email, nickname
      `,
    [
      email,
      nickname,
      profileImage
    ],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 리프레시 토큰 갱신
const updateRefreshToken = async (
  client: any,
  userId: number,
  refreshToken: string
) => {
  const { rows: existingRows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = $1
    AND is_deleted = false
    `,
    [userId],
  );

  if (existingRows.length === 0) return false;

  const { rows } = await client.query(
    `
    UPDATE "user"
    SET refresh_token = $2, updated_at = now()
    WHERE id = $1
    AND is_deleted = false
    RETURNING *
    `,
    [userId, refreshToken],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
  findUserById,
  findUserByEmail,
  createUser,
  updateRefreshToken
}