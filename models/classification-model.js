const pool = require('../database/pool');

async function getClassifications() {
  const result = await pool.query('SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name');
  return result.rows;
}

async function insertClassification(classification_name) {
  const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id';
  const res = await pool.query(sql, [classification_name]);
  return { rowCount: res.rowCount, classification_id: res.rows && res.rows[0] ? res.rows[0].classification_id : undefined };
}

module.exports = {
  getClassifications,
  insertClassification,
};
