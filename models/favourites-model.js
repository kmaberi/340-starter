// models/favorites-model.js
const pool = require('../database/pool');

async function addFavorite(account_id, inv_id) {
  const sql = `INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING favorite_id`;
  const values = [account_id, inv_id];
  try {
    const result = await pool.query(sql, values);
    return result.rowCount ? result.rows[0] : null;
  } catch (err) {
    throw err;
  }
}

async function removeFavorite(account_id, inv_id) {
  const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2`;
  const values = [account_id, inv_id];
  try {
    const result = await pool.query(sql, values);
    return result.rowCount;
  } catch (err) {
    throw err;
  }
}

async function getFavoritesByAccount(account_id) {
  const sql = `
    SELECT f.favorite_id, i.* 
    FROM favorites f
    JOIN inventory i ON f.inv_id = i.inv_id
    WHERE f.account_id = $1
    ORDER BY f.created_at DESC
  `;
  try {
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function isFavorited(account_id, inv_id) {
  const sql = `SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2`;
  try {
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount > 0;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
  isFavorited,
};
