require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
  process.on('unhandledRejection', err => console.error('UNHANDLED:', err));
  process.on('uncaughtException', err => console.error('UNCAUGHT:', err));

  try {
    console.log('Inserting...');
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      ['testuser' + Date.now(), 'test' + Date.now() + '@t.com', 'hash', 'token']
    );
    console.log('Inserted:', result.rows[0]);

    console.log('Marking as verified...');
    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1',
      [result.rows[0].id]
    );
    console.log('Verified.');

    const verified = await pool.query('SELECT * FROM users WHERE id=$1', [result.rows[0].id]);
    console.log('Final user:', verified.rows[0]);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await pool.end();
  }
}
test();
