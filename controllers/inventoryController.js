// controllers/inventoryController.js
const inventoryModel = require('../models/inventory-model');
const classificationModel = require('../models/classification-model');
const utilities = require('../utilities');
const validator = require('validator');

// Vehicle detail view
exports.buildDetailView = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    if (!inv_id) return res.status(400).render('error', { title: 'Bad Request', message: 'Missing vehicle id', nav: await utilities.getNav() });

    const vehicle = await inventoryModel.getVehicleById(inv_id);
    if (!vehicle) {
      return res.status(404).render('error', { title: 'Vehicle Not Found', message: 'Vehicle not found.', nav: await utilities.getNav() });
    }

    const vehicleDetailHTML = await utilities.renderVehicleDetailHTML(vehicle);
    
    // Get reviews for this vehicle
    let reviews = [];
    let reviewStats = { total_reviews: 0, avg_rating: 0 };
    try {
      const reviewController = require('./review-controller');
      reviews = await reviewController.getReviewsByVehicleId(inv_id);
      reviewStats = await reviewController.getVehicleReviewStats(inv_id);
    } catch (reviewErr) {
      console.warn('Could not load reviews:', reviewErr.message);
    }
    
    res.render('inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
      vehicle,
      vehicleDetailHTML,
      reviews,
      reviewStats,
      nav: await utilities.getNav(),
    });
  } catch (err) {
    console.error('buildDetailView error:', err);
    next(err);
  }
};

// Management view
exports.buildManagementView = async (req, res, next) => {
  try {
    const message = req.flash ? req.flash('message') : null;
    const classificationList = await utilities.buildClassificationList();
    res.render('inventory/management', {
      title: 'Inventory Management',
      message: message && message.length ? message : null,
      classificationList,
      nav: await utilities.getNav(),
    });
  } catch (err) {
    next(err);
  }
};

// Return Inventory by Classification as JSON (for AJAX)
exports.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id, 10);
    if (!classification_id) return next(new Error('Invalid classification id'));
    const data = await inventoryModel.getVehiclesByClassification(classification_id);
    if (Array.isArray(data) && data.length > 0) {
      return res.json(data);
    }
    return next(new Error('No data returned'));
  } catch (err) {
    next(err);
  }
};

// Build edit inventory view
exports.editInventoryView = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!inv_id) return next(new Error('Invalid inventory id'));
    const itemData = await inventoryModel.getVehicleById(inv_id);
    if (!itemData) return next(new Error('Item not found'));
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render('inventory/edit-inventory', {
      title: `Edit ${itemName}`,
      nav: await utilities.getNav(),
      classificationList,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (err) {
    next(err);
  }
};

// Update Inventory Data
exports.updateInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const updated = await inventoryModel.updateInventoryItem(parseInt(inv_id, 10), {
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    });

    if (updated) {
      const itemName = `${updated.inv_make} ${updated.inv_model}`;
      req.flash('message', `The ${itemName} was successfully updated.`);
      return res.redirect('/inv/');
    }

    const classificationList = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash('message', 'Sorry, the update failed.');
    return res.status(501).render('inventory/edit-inventory', {
      title: `Edit ${itemName}`,
      nav,
      classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  } catch (err) {
    next(err);
  }
};

// Add Classification View (GET)
exports.addClassificationView = async (req, res, next) => {
  try {
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      message: req.flash ? req.flash('message') : null,
      errors: null,
      classification_name: '',
      nav: await utilities.getNav(),
    });
  } catch (err) {
    next(err);
  }
};

// Add Classification (POST)
exports.addClassification = async (req, res, next) => {
  try {
    let { classification_name } = req.body;
    classification_name = classification_name ? classification_name.trim() : '';

    const result = await classificationModel.insertClassification(classification_name);
    if (result && (result.rowCount === 1 || result.affectedRows === 1 || result.id || result.classification_id)) {
      req.flash('message', `Classification "${classification_name}" added successfully.`);
      return res.redirect('/inv');
    } else {
      req.flash('message', 'Failed to add classification.');
      return res.status(500).render('inventory/add-classification', {
        title: 'Add Classification',
        message: req.flash('message'),
        errors: null,
        classification_name,
        nav: await utilities.getNav(),
      });
    }
  } catch (err) {
    next(err);
  }
};

// Add Inventory View (GET)
exports.addInventoryView = async (req, res, next) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      message: req.flash ? req.flash('message') : null,
      errors: null,
      classificationList,
      classification_id: '', inv_make: '', inv_model: '', inv_year: '', inv_description: '',
      inv_image: '/images/vehicles/no-image.png', inv_thumbnail: '/images/vehicles/no-image-tn.png', inv_price: '', inv_miles: '', inv_color: '',
      nav: await utilities.getNav(),
    });
  } catch (err) {
    next(err);
  }
};

// Add Inventory (POST)
exports.addInventory = async (req, res, next) => {
  try {
    let {
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    classification_id = classification_id || '';
    inv_make = inv_make ? inv_make.trim() : '';
    inv_model = inv_model ? inv_model.trim() : '';
    inv_year = inv_year ? inv_year.trim() : '';
    inv_description = inv_description ? inv_description.trim() : '';
    inv_image = inv_image ? inv_image.trim() : '/images/vehicles/no-image.png';
    inv_thumbnail = inv_thumbnail ? inv_thumbnail.trim() : '/images/vehicles/no-image-tn.png';
    inv_price = inv_price ? inv_price.trim() : '';
    inv_miles = inv_miles ? inv_miles.trim() : '';
    inv_color = inv_color ? inv_color.trim() : '';

    const result = await inventoryModel.addInventoryItem({
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    });

    if (result) {
      req.flash('message', 'Vehicle added successfully!');
      return res.redirect('/inv');
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      req.flash('message', 'Failed to add vehicle.');
      return res.status(500).render('inventory/add-inventory', {
        title: 'Add Inventory',
        message: req.flash('message'),
        errors: null,
        classificationList,
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
        nav: await utilities.getNav(),
      });
    }
  } catch (err) {
    next(err);
  }
};

// Vehicles by Classification (GET)

exports.getVehiclesByType = async (req, res, next) => {
  try {
    const classificationId = req.params.classificationId || req.params.type;
    if (!classificationId) {
      return res.status(400).render('error', { title: 'Bad Request', message: 'Missing classification id', nav: await utilities.getNav() });
    }

    const vehicles = await inventoryModel.getVehiclesByClassification(classificationId);
    // buildClassificationGrid returns an HTML string
    const grid = utilities.buildClassificationGrid(vehicles);

    const className = (Array.isArray(vehicles) && vehicles.length > 0) 
      ? vehicles[0].classification_name 
      : `Classification ${classificationId}`;

    res.render('inventory/classification', {
      title: `${className} vehicles`,
      grid,                      // HTML string
      nav: await utilities.getNav()
    });
  } catch (err) {
    console.error('getVehiclesByType error:', err);
    next(err);
  }
};
// Note: If you want to support both /type/:type and /type/id/:classificationId routes,
// you can map req.params.type to req.params.classificationId in the route handler.