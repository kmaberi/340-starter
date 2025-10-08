const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/**
 * Get a specific vehicle by inventory id
 */
async function getVehicleById(inv_id) {
  const result = await pool.query(
    'SELECT * FROM public.inventory WHERE inv_id = $1',
    [inv_id]
  );
  return result.rows[0];
}

module.exports = {
  getClassifications,
  getVehicleById
};