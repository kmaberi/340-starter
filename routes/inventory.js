const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const utilities = require('../utilities/');
const invValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification view (public)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view (public) - matches existing controller function
router.get('/detail/:inv_id', utilities.handleErrors(invController.getVehicleDetail));

// Management routes (require Employee/Admin access)
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.managementView));
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addClassificationView));
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addInventoryView));

// POST routes for adding data (require Employee/Admin access)
router.post("/add-classification", 
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.post("/add-inventory", 
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;