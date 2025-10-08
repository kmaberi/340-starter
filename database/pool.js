
console.log('pool.js loaded');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

// Smoke-test query
pool
  .query('SELECT NOW()')
  .then(res => console.log('🟢 DB Time:', res.rows[0].now))
  .catch(err => console.error('🔴 DB Error:', err.stack));

module.exports = pool;