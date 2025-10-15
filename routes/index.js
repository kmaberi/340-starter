// routes/index.js
const express = require('express');
const router = express.Router();
const utilities = require('../utilities');

// Home route - wrapped with error handling middleware
router.get('/', utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.render('index', { 
    title: 'CSE Motors', 
    nav,
    message: null
  });
}));

module.exports = router;