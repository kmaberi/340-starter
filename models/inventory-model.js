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
}
// Get vehicles by classification name
async function getVehiclesByClassification(type) {
    try {
        const sql = 'SELECT * FROM inventory WHERE classification_name = $1';
        const values = [type];
        const result = await pool.query(sql, values);
        return result.rows;
    } catch (error) {
        console.error('Error in getVehiclesByClassification:', error);
        return [];
    }
}

module.exports.getVehiclesByClassification = getVehiclesByClassification;

async function getVehiclesByClassification(type) {
    try {
        const sql = 'SELECT * FROM inventory WHERE classification_name = ';
        const result = await pool.query(sql, [type]);
        return result.rows;
    } catch (error) {
        console.error('Error in getVehiclesByClassification:', error);
        return [];
    }
}
module.exports.getVehiclesByClassification = getVehiclesByClassification;
