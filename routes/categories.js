/**
 * Route handlers for vehicle categories and general navigation
 */

const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const invController = require('../controllers/inventoryController');
const { ValidationError, NotFoundError } = require('../views/errors/errors');

// Route to build home page view
router.get("/", utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Home",
    nav,
    errors: null,
  })
}))

// Route to build inventory by classification view
router.get("/inv/type/:classificationId", utilities.handleErrors(async (req, res, next) => {
  const classification_id = req.params.classificationId
  const data = await invController.getVehiclesByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}))

// About page
router.get('/about', utilities.handleErrors(async (req, res) => {
  res.render('about', {
    title: 'About Us',
    nav: await utilities.getNav()
  });
}));

// About page route
router.get('/about', utilities.handleErrors(async (req, res) => {
  res.render('about', {
    title: 'About CSE Motors',
    nav: await utilities.getNav()
  });
}));

// Contact page route
router.get('/contact', utilities.handleErrors(async (req, res) => {
  res.render('contact', {
    title: 'Contact Us',
    nav: await utilities.getNav()
  });
}));

// Contact form submission
router.post('/contact', utilities.handleErrors(async (req, res) => {
  // Here you would handle the contact form submission
  // For now, we'll just redirect back with a success message
  req.flash('notice', 'Thank you for your message. We will contact you soon!');
  res.redirect('/contact');
}));

// Error handler for undefined routes
router.use((req, res) => {
  throw new NotFoundError('Page not found');
});

module.exports = router;