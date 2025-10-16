// start-debug-server.js - Enhanced server startup with debugging
console.log('🚀 Starting CSE Motors server with debug logging...\n');

// Load environment
require('dotenv').config();
console.log('✅ Environment loaded');
console.log('   PORT:', process.env.PORT || 5500);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

// Enhanced error logging
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Load server dependencies
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');

console.log('✅ Express dependencies loaded');

// Load database
let db;
try {
  db = require('./database');
  console.log('✅ Database module loaded');
} catch (error) {
  console.error('❌ Database loading failed:', error.message);
  process.exit(1);
}

// Load utilities
let utilities;
try {
  utilities = require('./utilities');
  console.log('✅ Utilities loaded');
} catch (err) {
  console.warn('⚠️ Warning: ./utilities failed to load:', err.message);
  utilities = {
    checkJWTToken: (req, res, next) => next(),
    getNav: async () => '',
    handleErrors: (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  };
}

const app = express();
const PORT = process.env.PORT || 5500;

// Settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
console.log('✅ Express settings configured');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session middleware with database store
try {
  app.use(
    session({
      store: new (require('connect-pg-simple')(session))({
        createTableIfMissing: true,
        pool: db.pool || db,
      }),
      secret: process.env.SESSION_SECRET || 'devSecret',
      resave: true,
      saveUninitialized: true,
      name: 'sessionId',
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      },
    })
  );
  console.log('✅ Session middleware configured');
} catch (error) {
  console.error('❌ Session middleware failed:', error.message);
  process.exit(1);
}

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = expressMessages(req, res);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
console.log('✅ Static files middleware configured');

// Local variables
app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.loggedin = 0;
  res.locals.accountData = null;
  next();
});

// JWT check middleware
app.use(utilities.checkJWTToken);

// Build nav for every request
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
  } catch (err) {
    console.error('⚠️ Error building nav:', err);
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>';
  }
  next();
});

console.log('✅ Middleware configured');

// Routes
console.log('Loading routes...');

// Index route
app.get('/', (req, res) => {
  res.render('index', { title: 'CSE Motors', nav: res.locals.nav });
});

// Account routes
try {
  const accountRouter = require('./routes/account');
  app.use('/account', accountRouter);
  console.log('✅ Account routes loaded at /account');
} catch (error) {
  console.error('❌ Account routes failed to load:', error.message);
  console.error('Stack:', error.stack);
}

// Inventory routes
try {
  const inventoryRouter = require('./routes/inventory');
  app.use('/inv', inventoryRouter);
  console.log('✅ Inventory routes loaded at /inv');
} catch (error) {
  console.warn('⚠️ Inventory routes failed to load:', error.message);
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => {
  console.log('❓ 404 - Route not found:', req.originalUrl);
  res.status(404);
  const notFoundError = new Error('Page not found');
  notFoundError.status = 404;
  return res.render('error', {
    title: 'Page not found',
    message: 'Page not found',
    error: notFoundError,
    nav: res.locals.nav
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack || err);
  res.status(err.status || 500);
  return res.render('error', {
    title: `${err.status || 500} - Error`,
    message: err.message || 'Internal Server Error',
    error: err,
    nav: res.locals.nav
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('\n🎉 CSE Motors server started successfully!');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🔐 Login page: http://localhost:${PORT}/account/login`);
  console.log('\n🔑 TEST CREDENTIALS:');
  console.log('   Email: test@example.com');
  console.log('   Password: TestPass123!');
  
  // Test database connectivity on startup
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connectivity confirmed');
  } catch (error) {
    console.error('❌ Database connectivity failed:', error.message);
  }
  
  console.log('\n📝 Ready to test login functionality!');
});