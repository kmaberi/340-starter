const jwt = require("jsonwebtoken");
require("dotenv").config();
const classificationModel = require('../models/classification-model');

function formatNumberWithCommas(n) {
  const num = Number(n);
  return num.toLocaleString();
}

function toUSDollars(n) {
  const num = Number(n);
  return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function buildClassificationGrid(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

function renderVehicleDetailHTML(vehicle) {
  let html = '<div class="vehicle-detail">'
  html += '<div class="vehicle-image">'
  html += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">`
  html += '</div>'
  html += '<div class="vehicle-info">'
  html += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`
  html += '<div class="vehicle-specs">'
  html += `<p class="price">Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`
  html += `<p>Mileage: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>`
  html += `<p>Color: ${vehicle.inv_color}</p>`
  html += '</div>'
  html += `<p class="description">${vehicle.inv_description}</p>`
  html += '</div>'
  html += '</div>'
  return html
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
// inside utilities/index.js

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav() {
  try {
    const data = await classificationModel.getClassifications()
    let list = '<ul class="nav-list">'
    list += '<li><a href="/" title="Home page" class="nav-link">Home</a></li>'
    data.forEach(row => {
      list += `<li>
        <a href="/inv/type/${row.classification_id}" 
           title="See our ${row.classification_name} lineup" 
           class="nav-link">
          ${row.classification_name}
        </a>
      </li>`
    })
    list += '</ul>'
    return list
  } catch (error) {
    console.error("getNav error:", error)
    return '<ul class="nav-list"><li><a href="/" class="nav-link">Home</a></li></ul>'
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationList(selectedId = null) {
  const data = await classificationModel.getClassifications(); // returns array or rows
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += '<option value="">Choose a Classification</option>';
  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${selectedId && row.classification_id == selectedId ? 'selected' : ''}>${row.classification_name}</option>`;
  });
  classificationList += '</select>';
  return classificationList;
}

async function buildClassificationGrid(data){
  let grid = '';
  if(Array.isArray(data) && data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
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
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}

/* ****************************************
 *  Check Account Type for Employee/Admin
 * ************************************ */
function checkAccountType(req, res, next) {
  if (res.locals.loggedin && (res.locals.accountData && (res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin"))) {
    next();
  } else {
    req.flash("notice", "You do not have permission to access this resource.");
    return res.redirect("/account/login");
  }
}

/* ****************************************
 * Shared data / metadata for site
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
