// database/index.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL === 'true' || false;

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

// helper wrapper that logs queries (keeps pool API available too)
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    console.log('executed query', { text });
    return res;
  } catch (error) {
    console.error('error in query', { text });
    throw error;
  }
}

// export both the query helper and the raw pool
module.exports = {
  query,
  pool,
};
