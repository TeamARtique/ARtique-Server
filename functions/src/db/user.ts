const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllUsers = async (client: any) => {
    const { rows } = await client.query(
        `
        SELECT * FROM "user" u
        WHERE is_deleted = FALSE
        `
    );
    console.log(convertSnakeToCamel.keysToCamel(rows));
    return convertSnakeToCamel.keysToCamel(rows);
}

module.exports = { getAllUsers };