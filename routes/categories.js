/**
 * Route handlers for vehicle categories and general navigation
 */

const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const invController = require('../controllers/inventoryController');
const { ValidationError, NotFoundError } = require('../views/errors/errors');

// Home page
router.get('/', utilities.handleErrors(async (req, res) => {
  res.render('index', {
    title: 'Home',
    nav: await utilities.getNav()
  });
}));

// Vehicle category routes
const categories = {
  'custom': 'Custom Vehicles',
  'sedan': 'Sedans',
  'sport': 'Sports Cars',
  'suv': 'SUVs',
  'truck': 'Trucks'
};

// Generic category handler
const handleCategory = (category, title) => {
  return utilities.handleErrors(async (req, res) => {
    try {
      const vehicles = await invController.getVehiclesByCategory(category);
      res.render('inventory/category', {
        title: title,
        nav: await utilities.getNav(),
        vehicles: vehicles,
        category: category
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        res.render('inventory/category', {
          title: title,
          nav: await utilities.getNav(),
          vehicles: [],
          message: `No ${category} vehicles found`,
          category: category
        });
      } else {
        throw error;
      }
    }
  });
};

// Register routes for each category
Object.entries(categories).forEach(([category, title]) => {
  router.get(`/${category}`, handleCategory(category, title));
});

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