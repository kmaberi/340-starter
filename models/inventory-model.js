const pool = require('../database'); // your database connection

// Get all classifications
async function getClassifications() {
  try {
    const sql = 'SELECT * FROM public.classification ORDER BY classification_name';
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error('getClassifications error:', error);
    throw error;
  }
}

// Get all inventory
async function getInventory() {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON i.classification_id = c.classification_id
      ORDER BY i.inv_make
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error('getInventory error:', error);
    throw error;
  }
}

async function getVehiclesByClassification(classificationId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory i
    JOIN public.classification c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make
  `;
  const result = await pool.query(sql, [classificationId]);
  return result.rows; // must be flat array
}


// Get inventory by ID
async function getVehicleById(invId) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `;
    const result = await pool.query(sql, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error('getVehicleById error:', error);
    throw error;
  }
}

// Add inventory item
async function addInventoryItem(data) {
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  } = data;

  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;
    const values = [
      inv_make, inv_model, parseInt(inv_year), inv_description,
      inv_image, inv_thumbnail, parseFloat(inv_price), parseInt(inv_miles),
      inv_color, parseInt(classification_id)
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('addInventoryItem error:', error);
    throw error;
  }
}

// Update inventory item
async function updateInventoryItem(invId, data) {
  const {
    inv_make, inv_model, inv_year, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  } = data;

  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make=$1, inv_model=$2, inv_year=$3, inv_description=$4,
          inv_image=$5, inv_thumbnail=$6, inv_price=$7, inv_miles=$8,
          inv_color=$9, classification_id=$10
      WHERE inv_id=$11
      RETURNING *
    `;
    const values = [
      inv_make, inv_model, parseInt(inv_year), inv_description,
      inv_image, inv_thumbnail, parseFloat(inv_price), parseInt(inv_miles),
      inv_color, parseInt(classification_id), invId
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('updateInventoryItem error:', error);
    throw error;
  }
}

// Delete inventory item
async function deleteInventoryItem(invId) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id=$1 RETURNING *';
    const result = await pool.query(sql, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error('deleteInventoryItem error:', error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventory,
  getVehiclesByClassification,
  getVehicleById,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
