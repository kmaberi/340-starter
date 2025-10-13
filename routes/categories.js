/**
 * Route handlers for vehicle categories and general navigation
 */

const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const invController = require('../controllers/inventoryController');
const { NotFoundError } = require('../views/errors/errors');

// Home page route
router.get("/", utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  res.render("index", {
    title: "Home",
    nav,
    errors: null,
  });
}));

// --- Category pages with friendly URLs ---
// Map each category to its classification_id in your DB
const categoryMap = {
  trucks: 4,   // Truck
  sport: 2,    // Sport
  sedan: 5,    // Sedan
  suv: 3       // SUV
};

Object.entries(categoryMap).forEach(([routeName, classificationId]) => {
  router.get(`/${routeName}`, utilities.handleErrors(async (req, res) => {
    const data = await invController.getVehiclesByType(classificationId);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data.length > 0 ? data[0].classification_name : "Vehicles";

    res.render("classification/list", { // Using your existing list.ejs
      title: `${className} Vehicles`,
      nav,
      grid
    });
  }));
});

// Inventory by dynamic classification ID (existing route)
router.get("/inv/type/:classificationId", utilities.handleErrors(async (req, res) => {
  const classification_id = req.params.classificationId;
  const data = await invController.getVehiclesByType(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data.length > 0 ? data[0].classification_name : "Vehicles";

  res.render("inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
}));

// About page
router.get('/about', utilities.handleErrors(async (req, res) => {
  res.render('about', {
    title: 'About CSE Motors',
    nav: await utilities.getNav()
  });
}));

// Contact page
router.get('/contact', utilities.handleErrors(async (req, res) => {
  res.render('contact', {
    title: 'Contact Us',
    nav: await utilities.getNav()
  });
}));

// Contact form submission
router.post('/contact', utilities.handleErrors(async (req, res) => {
  req.flash('notice', 'Thank you for your message. We will contact you soon!');
  res.redirect('/contact');
}));

// Error handler for undefined routes
router.use((req, res) => {
  throw new NotFoundError('Page not found');
});

module.exports = router;
