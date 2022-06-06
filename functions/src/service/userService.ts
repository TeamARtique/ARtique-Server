import userProfileDTO from "../interface/req/userProfileDTO";
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

// ✅ refreshToken값으로 유저 찾기
const findUserByRefreshToken = async (client: any, refreshToken: string) => {
  const { rows } = await client.query(
    `
      SELECT id as user_id, email, nickname 
      FROM "user"
      WHERE refresh_token = $1
      AND is_deleted = false
      `,
    [refreshToken],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 유저 생성
const createUser = async (
  client: any,        
  email: string,
  refreshToken: string
) => {
  const { rows } = await client.query(
    `
      INSERT INTO "user"
      (email, refresh_token)
      VALUES
      ($1, $2)
      RETURNING id as user_id, email
      `,
    [
      email,
      refreshToken
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

// ✅ 유저 정보 수정
const updateUser = async (client: any, userId: number, userProfileDTO: userProfileDTO) => {
  const { rows } = await client.query(
    `
    UPDATE "user" u
    SET profile_image = $2,
        nickname = $3,
        introduction = $4,
        website = $5
    WHERE u.id = $1
    RETURNING *

    `,
    [userId, userProfileDTO.profileImage, userProfileDTO.nickname, userProfileDTO.introduction, userProfileDTO.website],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// ✅ 유저 삭제(회원 탈퇴)
const deleteUser = async (client: any, userId: number) => {
  const { rows } = await client.query(
    `
    UPDATE "user" u
    SET is_deleted = true
    WHERE u.id = $1
    RETURNING is_deleted
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

export default {
  findUserById,
  findUserByEmail,
  createUser,
  updateRefreshToken,
  updateUser,
  deleteUser,
  findUserByRefreshToken,
}