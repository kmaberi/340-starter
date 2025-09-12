// server.js
/* ******************************************
 * Application server - Express + EJS + Layouts
 * ******************************************/
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const portfinder = require("portfinder");
require('dotenv').config();

const app = express();

/* ---------- Body parsers ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ---------- Views / Templating ---------- */
// explicit absolute views path (robust for dev + deploy)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// express-ejs-layouts (register once)
app.use(expressLayouts);

// Default layout name (expects views/layouts/layout.ejs)
app.set('layout', 'layouts/layout');

/* ---------- Static assets ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- Small debug info ---------- */
console.log('Views directory:', app.get('views'));
console.log('Views directory:', app.get('views'));
console.log('Layout setting:', app.get('layout') + '.ejs');
/* ******************************************
 * Routes
 * ****************************************** */

// Home (renders views/index.ejs into views/layout.ejs)
app.get('/', (req, res) => {
  res.render('index', { title: 'CSE Motors' });
});

// Example of another route
app.get('/about', (req, res) => {
  res.render('about', { title: 'About CSE Motors' }); // create views/about.ejs if used
});

/* 404 handler */
app.use((req, res) => {
  res.status(index);
  // If you have a 404.ejs, render it; otherwise send a simple message
  if (res.render) {
    return res.render('404', { title: 'Not Found' }); // optional: create views/404.ejs
  }
  res.send('404 - Not Found');
});

/* ******************************************
 * Start server
 * ****************************************** */
const PORT = process.env.PORT || 5501;
portfinder.getPort((err, port) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
