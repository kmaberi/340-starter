const express = require('express');
const router  = express.Router();
const classCtrl = require('../controllers/classification-controller');

// GET /classification/:name
router.get('/:name', classCtrl.getByClassification);

module.exports = router;