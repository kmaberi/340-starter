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

function renderVehicleDetailHTML(v) {
  const mainImg = v.inv_image && v.inv_image.startsWith('/') ? v.inv_image : `/images/vehicles/${v.inv_image}`;
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-detail-image">
        <img src="${mainImg}" alt="${v.inv_make} ${v.inv_model}" />
      </div>
      <div class="vehicle-detail-info">
        <h1>${v.inv_make} ${v.inv_model} (${v.inv_year})</h1>
        <h2>Price: $${Number(v.inv_price).toLocaleString()}</h2>
        <ul>
          <li><strong>Mileage:</strong> ${Number(v.inv_miles).toLocaleString()} miles</li>
          <li><strong>Color:</strong> ${v.inv_color}</li>
          <li><strong>Fuel Type:</strong> ${v.inv_fuel}</li>
          <li><strong>Engine:</strong> ${v.inv_engine || 'Not specified'}</li>
          <li><strong>Transmission:</strong> ${v.inv_transmission || 'Not specified'}</li>
        </ul>
        <div class="vehicle-detail-description">
          <h4>Description</h4>
          <p>${v.inv_description}</p>
        </div>
      </div>
    </div>
  `;
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
// inside utilities/index.js

async function getNav(){
  try {
    let data = await classificationModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        list += "<li>";
        list +=
          '<a href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>";
        list += "</li>";
      });
    }
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error in getNav:", error);
    return "<ul><li><a href='/'>Home</a></li></ul>";
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
