/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoutes = require('./routes/inventory');
const miscRouter = require('./routes/misc');
const accountRoutes = require('./routes/account');
const reviewRoutes = require('./routes/review');
const categoryRoutes = require('./routes/categories');
const pool = require('./database/pool');
const classificationModel = require('./models/classification-model');
const classificationRouter = require('./routes/classification');
const session = require('express-session');
const flash = require('connect-flash');
const utilities = require('./utilities/');
const { checkJwtCookie } = require('./utilities/accountAuth');

/* ***********************
 * Middleware & View Engine
 *************************/
// Cookie parser - must be before any middleware that uses cookies
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Flash messages
app.use(flash());

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// JWT Check middleware - runs on every request
app.use(checkJwtCookie);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

/* ***********************
 * Favicon
 *************************/
app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/public/images/site/favicon-32x32.png');
});

/* ***********************
 * Load classifications for navigation
 *************************/
app.use(async (req, res, next) => {
  try {
    const classifications = await classificationModel.getClassifications();
    res.locals.classifications = classifications;
    res.locals.active = '';
    res.locals.flash = req.flash();
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    console.error("Error loading classifications:", err);
    res.locals.classifications = [];
    res.locals.active = '';
    res.locals.flash = req.flash();
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>';
    next();
  }
});

/* ***********************
 * Static Files
 *************************/
app.use(express.static('public'));

/* ***********************
 * Routes
 *************************/
app.use(static);

// Account routes
app.use('/account', accountRoutes);

// Inventory routes
app.use('/inv', inventoryRoutes);
app.use('/inventory', inventoryRoutes);

// Category and main navigation routes
app.use('/', categoryRoutes);

// Review routes
app.use('/review', reviewRoutes);

// Misc routes
app.use(miscRouter);

// Classification routes
app.use('/classification', classificationRouter);

// Root route
app.get('/', (req, res) => {
  res.locals.active = 'home';
  res.render('index', { title: 'Home' });
});

// Temporary setup route - REMOVE AFTER USE
app.get('/setup-db', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const sql1 = fs.readFileSync(path.join(__dirname, 'database/assignment2.sql'), 'utf8');
    const sql2 = fs.readFileSync(path.join(__dirname, 'database/reviews.sql'), 'utf8');
    
    await pool.query(sql1);
    await pool.query(sql2);
    
    res.send('Database setup complete! Remove this route now.');
  } catch (error) {
    res.send('Setup failed: ' + error.message);
  }
});

/* ***********************
 * Error Handlers
 *************************/
// 404 handler
app.use((req, res, next) => {
  const err = new Error(`Not Found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    title: `${err.status || 500} – Error`,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});