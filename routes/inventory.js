const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const utilities = require('../utilities');
const invValidate = require('../utilities/inventory-validation'); // optional express-validator middleware

// Management view (access by /inv/)
router.get('/', utilities.handleErrors(invController.buildManagementView));

// Add classification - GET & POST
router.get('/add-classification', utilities.handleErrors(invController.addClassificationView));
router.post('/add-classification',
  // optional server-side validation middleware - you can use invValidate.classificationRules() if implemented
  utilities.handleErrors(invController.addClassification)
);

// Add inventory - GET & POST
router.get('/add-inventory', utilities.handleErrors(invController.addInventoryView));
router.post('/add-inventory',
  // optional server-side validation middleware - e.g. invValidate.inventoryRules()
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
