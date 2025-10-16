// utilities/index.js
'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();
const classificationModel = require('../models/classification-model');

// Simple helpers
function formatNumberWithCommas(n) {
  const num = Number(n) || 0;
  return num.toLocaleString();
}

function toUSDollars(n) {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* Build classification select list (returns HTML string) */
async function buildClassificationList(selectedId = null) {
  try {
    const data = await classificationModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += '<option value="">Choose a Classification</option>';
    data.forEach((row) => {
      classificationList += `<option value="${row.classification_id}" ${selectedId && row.classification_id == selectedId ? 'selected' : ''}>${row.classification_name}</option>`;
    });
    classificationList += '</select>';
    return classificationList;
  } catch (err) {
    console.error('buildClassificationList error:', err);
    return '<select name="classification_id" id="classificationList"><option value="">Choose a Classification</option></select>';
  }
}

/* Build a classification grid from vehicle rows (returns HTML string) */
function buildClassificationGrid(data) {
  let grid = '';
  if (Array.isArray(data) && data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => {
      grid += '<li>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>`;
      grid += '</h2>';
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* Render vehicle detail HTML */
function renderVehicleDetailHTML(vehicle) {
  if (!vehicle) return '';
  
  let html = '<div class="vehicle-detail">';
  
  // Image section
  html += '<div class="vehicle-image">';
  html += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" />`;
  html += '</div>';
  
  // Info section
  html += '<div class="vehicle-info">';
  html += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
  
  // Prominent specs section
  html += '<div class="vehicle-prominent-specs">';
  html += `<div class="spec-item price-spec">`;
  html += `<span class="spec-label">Price:</span>`;
  html += `<span class="spec-value price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
  html += `</div>`;
  html += `<div class="spec-item year-spec">`;
  html += `<span class="spec-label">Year:</span>`;
  html += `<span class="spec-value">${vehicle.inv_year}</span>`;
  html += `</div>`;
  html += `<div class="spec-item mileage-spec">`;
  html += `<span class="spec-label">Mileage:</span>`;
  html += `<span class="spec-value">${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</span>`;
  html += `</div>`;
  html += '</div>';
  
  // Additional details
  html += '<div class="vehicle-details">';
  html += '<h3>Vehicle Details</h3>';
  html += '<ul class="detail-list">';
  html += `<li><strong>Make:</strong> ${vehicle.inv_make}</li>`;
  html += `<li><strong>Model:</strong> ${vehicle.inv_model}</li>`;
  html += `<li><strong>Color:</strong> ${vehicle.inv_color}</li>`;
  html += `<li><strong>Classification:</strong> ${vehicle.classification_name || 'N/A'}</li>`;
  html += '</ul>';
  html += '</div>';
  
  // Description
  if (vehicle.inv_description) {
    html += '<div class="vehicle-description">';
    html += '<h3>Description</h3>';
    html += `<p>${vehicle.inv_description}</p>`;
    html += '</div>';
  }
  
  html += '</div>'; // Close vehicle-info
  html += '</div>'; // Close vehicle-detail
  
  return html;
}

/* Build nav (reads classifications and returns HTML) */
async function getNav() {
  try {
    const data = await classificationModel.getClassifications();
    let list = '<ul class="nav-list">';
    list += '<li><a href="/" title="Home page" class="nav-link">Home</a></li>';
    data.forEach(row => {
      list += `<li>
        <a href="/inv/type/${row.classification_id}" title="See our ${row.classification_name} lineup" class="nav-link">
          ${row.classification_name}
        </a>
      </li>`;
    });
    list += '</ul>';
    return list;
  } catch (error) {
    console.error('getNav error:', error);
    return '<ul class="nav-list"><li><a href="/" class="nav-link">Home</a></li></ul>';
  }
}

// utilities/index.js — safe handleErrors middleware
function handleErrors(fn) {
  // if fn is not a function, return middleware that calls next() with a descriptive Error
  if (typeof fn !== 'function') {
    return (req, res, next) => {
      const message = `handleErrors wrapper expects a function but received: ${typeof fn}`;
      // log for debugging
      console.error(message, { route: req.originalUrl });
      return next(new Error(message));
    };
  }

  // proper wrapper for async controller functions
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}


/* JWT cookie check middleware */
function checkJWTToken(req, res, next) {
  try {
    if (req && req.cookies && req.cookies.jwt) {
      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
      if (!secret) {
        console.warn('ACCESS_TOKEN_SECRET / JWT_SECRET not set; skipping JWT verification.');
        return next();
      }
      jwt.verify(req.cookies.jwt, secret, (err, accountData) => {
        if (err) {
          req.flash('notice', 'Please log in');
          res.clearCookie('jwt');
          return res.redirect('/account/login');
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        return next();
      });
    } else {
      return next();
    }
  } catch (err) {
    console.error('checkJWTToken error:', err);
    return next();
  }
}

/* checkLogin middleware */
function checkLogin(req, res, next) {
  if (res.locals && res.locals.loggedin) {
    return next();
  }
  req.flash('notice', 'Please log in.');
  return res.redirect('/account/login');
}

/* checkAccountType middleware */
function checkAccountType(req, res, next) {
  if (res.locals && res.locals.loggedin && res.locals.accountData) {
    const t = res.locals.accountData.account_type || '';
    if (t === 'Employee' || t === 'Admin') {
      return next();
    }
  }
  req.flash('notice', 'You do not have permission to access this resource.');
  return res.redirect('/account/login');
}

/* site metadata */
const siteMeta = {
  siteName: 'CSE Motors',
  author: 'Kenneth Maberi',
  authorEmail: 'kennethmaberi@gmail.com',
  createdAt: new Date().toISOString(),
};

console.log('utilities loaded');

module.exports = {
  formatNumberWithCommas,
  toUSDollars,
  renderVehicleDetailHTML,
  getNav,
  buildClassificationList,
  buildClassificationGrid,
  handleErrors,
  checkJWTToken,
  checkLogin,
  checkAccountType,
  siteMeta,
};
