// models/inventoryModel.js (append or create)
const pool = require('../database/pool');

// Insert new classification
async function insertClassification(classification_name) {
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1)';
  const values = [classification_name];
  return pool.query(sql, values);
}

// Insert new inventory item
async function insertInventory(data) {
  // destructure expected fields
  const {
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  } = data;

  const sql = `
    INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;
  const values = [
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  ];
  return pool.query(sql, values);
}

module.exports = {
  insertClassification,
  insertInventory,
  // ...other functions like getClassifications, getVehicleById etc.
};
