console.log('pool.js loaded')

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require'
    ? { rejectUnauthorized: false }
    : false,
});

// Smoke-test query
pool
  .query('SELECT NOW()')
  .then(res => console.log('🟢 DB Time:', res.rows[0].now))
  .catch(err => console.error('🔴 DB Error:', err.stack));

module.exports = pool;