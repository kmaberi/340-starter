// Put this at the very top of the file (first lines)
require('dotenv').config();
const { Pool } = require('pg');

// DEBUG: show what Node sees (temporary)
console.log('DEBUG: DATABASE_URL present?', !!process.env.DATABASE_URL);
console.log('DEBUG: DB_PASSWORD type:', typeof process.env.DB_PASSWORD, 'value:', JSON.stringify(process.env.DB_PASSWORD));

// Use the connection string if present (preferred)
const connectionString = process.env.DATABASE_URL || null;

const pool = connectionString
  ? new Pool({
      connectionString,
      // many managed Postgres providers require SSL
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD !== undefined ? String(process.env.DB_PASSWORD) : undefined,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : undefined,
    });

pool.on('error', (err) => {
  console.error('POOL ERROR', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
