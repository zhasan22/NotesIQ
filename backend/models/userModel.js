const pool = require('../db2');

const findUserByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT username, email, joined_at, avatar_url FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT 1 FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const findUserByUsernameOrEmail = async (usernameOrEmail) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 OR email = $1',
    [usernameOrEmail]
  );
  return result.rows[0];
};

const createUser = async (username, email, hashedPassword, token) => {
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, verification_token) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email`,
    [username, email, hashedPassword, token]
  );
  return result.rows[0];
};

const findUserByVerificationToken = async (token) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE verification_token = $1",
    [token]
  );
  return result.rows[0];
};

const markUserAsVerified = async (userId) => {
  await pool.query(
    `UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1`,
    [userId]
  );
};

const updateLastLogin = async (userId) => {
  await pool.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
};

const updateUsername = async (userId, newUsername) => {
  const result = await pool.query(
    'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2 RETURNING username',
    [newUsername, userId]
  );
  return result.rows[0];
};

const updatePassword = async (userId, newHashedPassword) => {
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHashedPassword, userId]
  );
};

const updateAvatar = async (userId, avatarUrl) => {
  const result = await pool.query(
    'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar_url',
    [avatarUrl, userId]
  );
  return result.rows[0];
};

const findPasswordHashById = async (userId) => {
  const result = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

module.exports = {
  findUserByUserId,
  findUserByUsername,
  findUserByEmail,
  findUserByUsernameOrEmail,
  findUserByVerificationToken,
  createUser,
  updateLastLogin,
  markUserAsVerified,
  updateUsername,
  updatePassword,
  updateAvatar,
  findPasswordHashById,
};
