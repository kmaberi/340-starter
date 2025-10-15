// routes/inventory.js
const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const invController = require('../controllers/inventoryController');
const invValidate = require('../utilities/inventory-validation');

// GET /inv/  -> inventory management page (or listing) - PROTECTED
router.get('/', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView));

// Alternative route for management
router.get('/management', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView));

// GET /inv/add-classification -> form to add classification - PROTECTED
router.get('/add-classification', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.addClassificationView));

// POST /inv/add-classification -> submit new classification - PROTECTED
router.post('/add-classification', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.addClassification));

// GET /inv/add-inventory -> form to add a vehicle - PROTECTED
router.get('/add-inventory', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.addInventoryView));

// POST /inv/add-inventory -> submit new vehicle - PROTECTED
router.post('/add-inventory', utilities.checkJWTToken, utilities.checkAccountType, invValidate.inventoryRules(), invValidate.checkInvData, utilities.handleErrors(invController.addInventory));

// AJAX: return inventory list for a classification - PROTECTED
router.get('/getInventory/:classification_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Edit inventory view - PROTECTED
router.get('/edit/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Update inventory - PROTECTED
router.post('/update', utilities.checkJWTToken, utilities.checkAccountType, invValidate.updateInventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// GET /inv/detail/:inv_id -> vehicle detail
router.get('/detail/:inv_id', utilities.handleErrors(invController.buildDetailView));

// Friendly route: GET /inv/type/:type or :classificationId used by your nav
// If your controller expects an id param named "type", we use that (matches your controller)
router.get('/type/:type', utilities.handleErrors(invController.getVehiclesByType));

// If you still need the numeric id route (some templates use classificationId param)
router.get('/type/id/:classificationId', utilities.handleErrors(async (req, res, next) => {
  // If you want to support numeric id, reuse getVehiclesByType by mapping param name
  req.params.type = req.params.classificationId;
  return invController.getVehiclesByType(req, res, next);
}));

module.exports = router;
