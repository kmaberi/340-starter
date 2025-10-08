/**
 * Vehicle category controller methods
 */

const invModel = require('../models/inventory-model');
const { ValidationError, NotFoundError } = require('../views/errors/errors');

/**
 * Get vehicles by category
 * @param {string} category - The vehicle category
 * @returns {Promise<Array>} Array of vehicles in the category
 */
async function getVehiclesByCategory(category) {
  try {
    // Normalize category name for database query
    const normalizedCategory = category.toLowerCase().trim();
    
    // Get vehicles from the database
    const vehicles = await invModel.getVehiclesByClassification(normalizedCategory);
    
    if (!vehicles || vehicles.length === 0) {
      throw new NotFoundError(`No vehicles found in ${category} category`);
    }
    
    return vehicles;
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw error;
    }
    throw new Error(`Error fetching ${category} vehicles: ${error.message}`);
  }
}

module.exports = {
  getVehiclesByCategory
};