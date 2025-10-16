// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');
const { pool } = require('./database');

let utilities;
try {
  utilities = require('./utilities'); // your utilities/index.js
  console.log('utilities loaded');
} catch (err) {
  console.warn('Warning: ./utilities failed to load:', err.message);
  // provide fallbacks so server still starts
  utilities = {
    checkJWTToken: (req, res, next) => next(),
    getNav: async () => '',
  };
}

const app = express();

// Settings
const PORT = process.env.PORT || 5500;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout'); // expects views/layouts/layout.ejs

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    store: new (require('connect-pg-simple')(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || 'devSecret',
    resave: true, // needed for flash messages
    saveUninitialized: true,
    name: 'sessionId',
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
  })
);
app.use(flash());
// Express Messages middleware (rendered via <%- messages() %>)
app.use(function (req, res, next) {
  res.locals.messages = expressMessages(req, res);
  next();
});

// static files
app.use(express.static(path.join(__dirname, 'public')));

// local variables available to all views
app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.loggedin = 0;
  res.locals.accountData = null;
  next();
});

// JWT check middleware (utilities.checkJWTToken should set res.locals.loggedin/accountData)
app.use(utilities.checkJWTToken);

// Build nav HTML for every request and attach to res.locals.nav
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
  } catch (err) {
    console.error('Error building nav:', err);
    res.locals.nav = '';
  }
  next();
});

// Safe route require helper
function tryRequireRoute(routePath) {
  try {
    return require(routePath);
  } catch (err) {
    console.warn(`Route ${routePath} not loaded:`, err.message);
    return null;
  }
}

// Routes
const indexRouter = tryRequireRoute('./routes/index') || (function () {
  const r = require('express').Router();
  r.get('/', (req, res) => res.render('index', { title: 'CSE Motors' }));
  return r;
})();

app.use('/', indexRouter);

const inventoryRouter = tryRequireRoute('./routes/inventory');
if (inventoryRouter) app.use('/inv', inventoryRouter);

const accountRouter = tryRequireRoute('./routes/account');
if (accountRouter) app.use('/account', accountRouter);

const reviewRouter = tryRequireRoute('./routes/review');
if (reviewRouter) app.use('/reviews', reviewRouter);

const miscRouter = tryRequireRoute('./routes/misc');
if (miscRouter) app.use('/', miscRouter);

// health endpoint
app.get('/health', (req, res) => res.json({ ok: true }));

// 404 handler
app.use((req, res) => {
  res.status(404);
  const notFoundError = new Error('Page not found');
  notFoundError.status = 404;
  // Pass an error object so the error view can safely read error.stack
  return res.render('error', {
    title: 'Page not found',
    message: 'Page not found',
    error: notFoundError,
    nav: res.locals.nav // optional if you want nav in the error view
  });
});


// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(err.status || 500);
  return res.render('error', {
    title: `${err.status || 500} - Error`,
    message: err.message || 'Internal Server Error',
    error: err,
    nav: res.locals.nav
  });
});


// Start
app.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}`);
});
