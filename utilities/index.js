const jwt = require("jsonwebtoken")
require("dotenv").config()
const classificationModel = require('../models/classification-model')

function formatNumberWithCommas(n) {
  const num = Number(n);
  return num.toLocaleString();
}
function toUSDollars(n) {
  const num = Number(n);
  return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function renderVehicleDetailHTML(v) {
  // Build thumbnail gallery array
  const thumbs = v.inv_thumbnail
    ? v.inv_thumbnail.split(',').map(fn =>
        fn.trim().startsWith('/') ? fn.trim() : `/img/vehicles/${fn.trim()}`
      )
    : [];

  // Main image path
  const mainImg = v.inv_image.startsWith('/') ? v.inv_image : `/img/vehicles/${v.inv_image}`;

  return `
  <div class="vehicle-detail">
    <!-- LEFT: Image + Gallery -->
    <div class="detail-gallery">
      <img src="${mainImg}" alt="${v.inv_make} ${v.inv_model}" class="main-img"/>
      <div class="thumbs">
        ${thumbs.map(t => `<img src="${t}" class="thumb" />`).join('')}
      </div>
    </div>

    <!-- RIGHT: Specs & Actions -->
    <div class="detail-info">
      <h2>${v.inv_make} ${v.inv_model} (${v.inv_year})</h2>

      <!-- Price & Mileage strip -->
      <div class="strip">
        <div class="strip-item">
          <span class="label">Mileage</span>
          <span class="value">${formatNumberWithCommas(v.inv_miles)}</span>
        </div>
        <div class="strip-item stripe-right">
          <span class="label">Price</span>
          <span class="value">${toUSDollars(v.inv_price)}</span>
        </div>
      </div>

      <!-- Detail list -->
      <ul class="spec-list">
        <li><strong>Color:</strong> ${v.inv_color}</li>
        <li><strong>Fuel Type:</strong> ${v.inv_fuel}</li>
        <li><strong>Engine:</strong> ${v.inv_engine || 'Not specified'}</li>
        <li><strong>Transmission:</strong> ${v.inv_transmission || 'Not specified'}</li>
      </ul>

      <!-- Description -->
      <div class="description">
        <h4>Description</h4>
        <p>${v.inv_description}</p>
      </div>

      <!-- CTA buttons -->
      <div class="cta-buttons">
        <button class="btn btn-primary">Contact Us</button>
        <button class="btn btn-secondary">Schedule Test Drive</button>
      </div>
    </div>
  </div>
  `;
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav(){
  try {
    let data = await classificationModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    // Fix: data is already an array from classification model, not data.rows
    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        list += "<li>"
        list +=
          '<a href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>"
        list += "</li>"
      })
    }
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error in getNav:", error)
    return "<ul><li><a href='/'>Home</a></li></ul>"
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationGrid(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
function handleErrors(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

/* ****************************************
* Middleware to check token validity
**************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("notice", "Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Account Type for Employee/Admin
 * ************************************ */
function checkAccountType(req, res, next) {
  if (res.locals.loggedin && (res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin")) {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this resource.")
    return res.redirect("/account/login")
  }
}

module.exports = {
  formatNumberWithCommas,
  toUSDollars,
  renderVehicleDetailHTML,
  getNav,
  buildClassificationGrid,
  handleErrors,
  checkJWTToken,
  checkLogin,
  checkAccountType
}