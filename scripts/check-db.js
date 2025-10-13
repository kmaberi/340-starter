// scripts/check-db.js
const pool = require('../database/pool');

(async () => {
  try {
    const cls = await pool.query('SELECT classification_id, classification_name FROM classification ORDER BY classification_id');
    console.log('Classifications:', cls.rows);
    const inv = await pool.query('SELECT inv_id, inv_make, inv_model, classification_id FROM inventory ORDER BY inv_id');
    console.log('Inventory count:', inv.rowCount);
    console.log(inv.rows.slice(0,20)); // sample rows
  } catch (err) {
    console.error('DB error:', err);
  } finally {
    await pool.end();
  }
})();
// server.js
/* ************************
 *  Import Dependencies *
 *************************/
require('dotenv').config(); // Load environment variables from .env file            