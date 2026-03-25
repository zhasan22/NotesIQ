// Run this once to add avatar_url to the users table
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    console.log('Migration done: avatar_url column added');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
migrate();
