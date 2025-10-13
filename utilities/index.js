// utilities/index.js
// Consolidated utilities module — duplicates removed and exports unified.

require('dotenv').config();
const jwt = require('jsonwebtoken');
const classificationModel = require('../models/classification-model');
const invModel = require('../models/inventory-model'); // used by some helpers below (optional)

// Simple helpers
function formatNumberWithCommas(n) {
  const num = Number(n) || 0;
  return num.toLocaleString();
}

function toUSDollars(n) {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* **************************************
 * Build classification grid HTML (for list pages)
 * Accepts an array of vehicle objects
 *************************************** */
function buildClassificationGrid(data) {
  let grid = '';
  if (Array.isArray(data) && data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => {
      grid += '<li>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid += '<img src="' + vehicle.inv_thumbnail + '" alt="Image of ' +
        vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
      grid += '</a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' +
        vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
        vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* **************************************
 * Render vehicle detail HTML (string)
 *************************************** */
function renderVehicleDetailHTML(vehicle) {
  if (!vehicle) return '<p class="notice">Vehicle details unavailable.</p>';

  let html = '<div class="vehicle-detail">';
  html += '<div class="vehicle-image">';
  html += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">`;
  html += '</div>';
  html += '<div class="vehicle-info">';
  html += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
  html += '<div class="vehicle-specs">';
  html += `<p class="price">Price: ${toUSDollars(vehicle.inv_price)}</p>`;
  html += `<p>Mileage: ${formatNumberWithCommas(vehicle.inv_miles)}</p>`;
  html += `<p>Color: ${vehicle.inv_color}</p>`;
  html += '</div>';
  html += `<p class="description">${vehicle.inv_description}</p>`;
  html += '</div>';
  html += '</div>';
  return html;
}

/* **************************************
 * Navigation builder
 *************************************** */
async function getNav() {
  try {
    const data = await classificationModel.getClassifications();
    let list = '<ul class="nav-list">';
    list += '<li><a href="/" title="Home page" class="nav-link">Home</a></li>';
    if (Array.isArray(data)) {
      data.forEach(row => {
        list += `<li>
          <a href="/inv/type/${row.classification_id}" title="See our ${row.classification_name} lineup" class="nav-link">
            ${row.classification_name}
          </a>
        </li>`;
      });
    }
    list += '</ul>';
    return list;
  } catch (error) {
    console.error('getNav error:', error);
    return '<ul class="nav-list"><li><a href="/" class="nav-link">Home</a></li></ul>';
  }
}

/* **************************************
 * Build classification select list (for forms)
 *************************************** */
async function buildClassificationList(selectedId = null) {
  try {
    const data = await classificationModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += '<option value="">Choose a Classification</option>';
    if (Array.isArray(data)) {
      data.forEach(row => {
        const selected = selectedId && row.classification_id == selectedId ? ' selected' : '';
        classificationList += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`;
      });
    }
    classificationList += '</select>';
    return classificationList;
  } catch (error) {
    console.error('buildClassificationList error:', error);
    return '<select id="classificationList"><option value="">No classifications available</option></select>';
  }
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
function handleErrors(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash('notice', 'Please log in');
        res.clearCookie('jwt');
        return res.redirect('/account/login');
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = 1;
      next();
    });
  } else {
    next();
  }
}

/* ****************************************
 *  Check Login
 **************************************** */
function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    return next();
  }
  req.flash('notice', 'Please log in.');
  return res.redirect('/account/login');
}

/* ****************************************
 *  Check Account Type for Employee/Admin
 **************************************** */
function checkAccountType(req, res, next) {
  if (res.locals.loggedin && res.locals.accountData && (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin')) {
    return next();
  }
  req.flash('notice', 'You do not have permission to access this resource.');
  return res.redirect('/account/login');
}

/* ****************************************
 * Site metadata
 **************************************** */
const siteMeta = {
  siteName: '340 Starter',
  author: 'kmaberi',
  createdAt: new Date().toISOString(),
};

console.log('utilities loaded');

module.exports = {
  formatNumberWithCommas,
  toUSDollars,
  buildClassificationGrid,
  renderVehicleDetailHTML,
  getNav,
  buildClassificationList,
  handleErrors,
  checkJWTToken,
  checkLogin,
  checkAccountType,
  siteMeta,
};
