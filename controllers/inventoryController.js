const inventoryModel = require('../models/inventoryModel'); // must provide insert functions
const utilities = require('../utilities');
const validator = require('validator');

// Management view (shows links + flash)
exports.buildManagementView = async (req, res, next) => {
  try {
    const message = req.flash('message');
    res.render('inventory/management', {
      title: 'Inventory Management',
      message: message.length ? message : null
    });
  } catch (err) {
    next(err);
  }
};

// Add-Classification View (GET)
exports.addClassificationView = (req, res) => {
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    message: req.flash('message'),
    classification_name: ''
  });
};

// Add-Classification (POST)
exports.addClassification = async (req, res, next) => {
  try {
    let classification_name = req.body.classification_name ? req.body.classification_name.trim() : '';

    // server-side validation: no spaces or special chars, only letters/numbers/underscores if you want
    if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
      req.flash('message', 'Classification name required and must not contain spaces or special characters.');
      return res.status(400).render('inventory/add-classification', {
        title: 'Add Classification',
        message: req.flash('message'),
        classification_name
      });
    }

    const result = await inventoryModel.insertClassification(classification_name);
    // For pg, result.rowCount; for mysql result.affectedRows
    if (result.rowCount === 1 || result.affectedRows === 1) {
      // rebuild nav is handled by your utilities.getNav / classification list on next request
      req.flash('message', `Classification "${classification_name}" added successfully.`);
      return res.redirect('/inv'); // management view shows message
    } else {
      req.flash('message', 'Failed to add classification.');
      return res.status(500).render('inventory/add-classification', {
        title: 'Add Classification',
        message: req.flash('message'),
        classification_name
      });
    }
  } catch (err) {
    next(err);
  }
};

// Add Inventory View (GET)
exports.addInventoryView = async (req, res, next) => {
  try {
    const classificationList = await utilities.buildClassificationList(); // returns <select> HTML
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      message: req.flash('message'),
      classificationList,
      // sticky defaults
      classification_id: '', inv_make: '', inv_model: '', inv_year: '', inv_description: '',
      inv_image: '', inv_thumbnail: '', inv_price: '', inv_miles: '', inv_color: ''
    });
  } catch (err) {
    next(err);
  }
};

// Add Inventory (POST)
exports.addInventory = async (req, res, next) => {
  try {
    // collect & trim
    let {
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    // make sticky values for re-rendering if errors
    classification_id = classification_id || '';
    inv_make = inv_make ? inv_make.trim() : '';
    inv_model = inv_model ? inv_model.trim() : '';
    inv_year = inv_year ? inv_year.trim() : '';
    inv_description = inv_description ? inv_description.trim() : '';
    inv_image = inv_image ? inv_image.trim() : '/img/no-image-available.png';
    inv_thumbnail = inv_thumbnail ? inv_thumbnail.trim() : '/img/no-image-available-tn.png';
    inv_price = inv_price ? inv_price.trim() : '';
    inv_miles = inv_miles ? inv_miles.trim() : '';
    inv_color = inv_color ? inv_color.trim() : '';

    // server-side validation
    const errors = [];
    if (!classification_id) errors.push('Classification is required.');
    if (!inv_make) errors.push('Make is required.');
    if (!inv_model) errors.push('Model is required.');
    if (!inv_year || !validator.isInt(inv_year, { min: 1900, max: 2099 })) errors.push('Year must be a valid 4-digit year.');
    if (!inv_description) errors.push('Description is required.');
    if (!inv_price || !validator.isFloat(inv_price)) errors.push('Price must be a number.');
    if (!inv_miles || !validator.isInt(inv_miles)) errors.push('Miles must be a number.');
    if (!inv_color) errors.push('Color is required.');

    if (errors.length > 0) {
      const classificationList = await utilities.buildClassificationList(classification_id);
      req.flash('message', errors.join(' '));
      return res.status(400).render('inventory/add-inventory', {
        title: 'Add Inventory',
        message: req.flash('message'),
        classificationList,
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      });
    }

    // attempt insert
    const result = await inventoryModel.insertInventory({
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    });

    if (result.rowCount === 1 || result.affectedRows === 1) {
      req.flash('message', 'Vehicle added successfully!');
      return res.redirect('/inv'); // management view shows a success message
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      req.flash('message', 'Failed to add vehicle.');
      return res.status(500).render('inventory/add-inventory', {
        title: 'Add Inventory',
        message: req.flash('message'),
        classificationList,
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      });
    }
  } catch (err) {
    next(err);
  }
};
