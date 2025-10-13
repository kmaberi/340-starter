// utilities/account-validation.js
// Lightweight validation stubs so routes won't throw if real validators are missing.
// Replace these with express-validator rules later if you want stricter checks.

const jwt = require('jsonwebtoken');

// Check token middleware (keeps existing behavior)
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
      return next();
    });
  } else {
    return next();
  }
}

// Check logged-in
function checkLogin(req, res, next) {
  if (res.locals && res.locals.loggedin) {
    return next();
  }
  req.flash('notice', 'Please log in.');
  return res.redirect('/account/login');
}

// Check account type (Employee or Admin)
function checkAccountType(req, res, next) {
  if (res.locals && res.locals.loggedin && res.locals.accountData) {
    const accountType = res.locals.accountData.account_type;
    if (accountType === 'Employee' || accountType === 'Admin') {
      return next();
    }
  }
  req.flash('notice', 'You do not have permission to access this resource.');
  return res.redirect('/account/login');
}

/* ------------------------
   Validation stubs (safe defaults)
   Replace these with proper validation rules (express-validator) when ready.
   Each *Rules returns middleware (or array) expected by router.post(...) usage.
   Each check* middleware validates req and either calls next() or sets flash + redirects.
   For now they simply call next().
   ------------------------ */

function registrationRules() {
  // Example: return [ body('email').isEmail(), body('password').isLength({min:6}) ]
  return (req, res, next) => next();
}

function checkRegData(req, res, next) {
  // If using express-validator, you'd check validationResult(req) here.
  return next();
}

function loginRules() {
  return (req, res, next) => next();
}

function checkLoginData(req, res, next) {
  return next();
}

function updateAccountRules() {
  return (req, res, next) => next();
}

function checkUpdateData(req, res, next) {
  return next();
}

function updatePasswordRules() {
  return (req, res, next) => next();
}

function checkPasswordData(req, res, next) {
  return next();
}

module.exports = {
  checkJWTToken,
  checkLogin,
  checkAccountType,

  // Validation stubs
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  updateAccountRules,
  checkUpdateData,
  updatePasswordRules,
  checkPasswordData,
};
