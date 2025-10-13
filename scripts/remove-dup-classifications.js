// scripts/remove-dup-classifications.js
const pool = require('../database/pool');

(async () => {
  try {
    // Remove duplicate classification rows, keep lowest id per name
    const sql = `
      DELETE FROM classification a
      USING classification b
      WHERE a.classification_id > b.classification_id
        AND a.classification_name = b.classification_name;
    `;
    const result = await pool.query(sql);
    console.log('Duplicate classifications removed. result:', result.rowCount);

    // Show remaining rows to confirm
    const res = await pool.query('SELECT classification_id, classification_name FROM classification ORDER BY classification_id;');
    console.log('Classifications now:', res.rows);
  } catch (err) {
    console.error('Error removing duplicates:', err);
  } finally {
    // Some projects export a pool object that doesn't have end(); to be safe:
    if (typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(0);
  }
})();
// server.js
/* ************************
 *  Import Dependencies * 
    *************************/
require('dotenv').config(); // Load environment variables from .env file
// --- IGNORE ---