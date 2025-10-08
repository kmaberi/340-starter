const inventoryModel = require('../models/inventory-model');
const { toUSDollars } = require('../utilities');

async function getByClassification(req, res, next) {
  try {
    const name = req.params.name.toLowerCase();
    const vehicles = await inventoryModel.getVehiclesByClassification(name);
    res.locals.active = name; // For navbar highlighting
    res.render('classification/list', {
      title: `${name} vehicles`,
      vehicles,
      toUSDollars
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByClassification,
};