const pool = require('../database/pool');

async function getClassifications() {
  const result = await pool.query('SELECT classification_id, classification_name FROM classification ORDER BY classification_name');
  return result.rows;
}

module.exports = {
  getClassifications,
};