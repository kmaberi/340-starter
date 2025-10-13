require('dotenv').config();
const { Pool } = require('pg');

// Create pool with SSL configuration for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Error handler for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export both query method and pool
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};