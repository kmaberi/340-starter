const inventoryModel = require('../models/inventory-model');
const utilities = require('../utilities');

// ----------------------------
// Vehicles by Classification
// ----------------------------
exports.getVehiclesByType = async (req, res, next) => {
  try {
    const classificationId = req.params.classificationId || req.params.type;
    if (!classificationId) {
      return res.status(400).render('error', { 
        title: 'Bad Request', 
        message: 'Missing classification id' 
      });
    }

    const vehicles = await inventoryModel.getVehiclesByClassification(classificationId);

    const className = vehicles.length > 0 
      ? vehicles[0].classification_name 
      : `Classification ${classificationId}`;

    res.render('inventory/classification', {
      title: `${className} vehicles`,
      grid: vehicles,       // send flat array
      nav: await utilities.getNav()
    });
  } catch (err) {
    console.error('getVehiclesByType error:', err);
    next(err);
  }
};
