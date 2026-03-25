const { Pool } = require("pg");
require('dotenv').config();
const logger = require('./utils/logger');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;

// Test the connectiony
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        logger.info('PostgreSQL connected. Time:', res.rows[0]);
        client.release();
      })
      .catch(err => {
        client.release();
        logger.error('Error during connection test:', err.stack);
      });
  })
  .catch(err => {
    logger.fatal('PostgreSQL connection failed:', err.stack);
  });