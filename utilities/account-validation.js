// utilities/account-validation.js
// Validation and auth helpers for account routes.

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const utilities = require('.');

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
  return [
    body('account_firstname')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Please provide a first name.'),

    body('account_lastname')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('Please provide a last name.'),

    body('account_email')
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage('A valid email is required.'),

    body('account_password')
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('Password does not meet requirements.'),
  ];
}

async function checkRegData(req, res, next) {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render('account/register', {
      title: 'Register',
      nav,
      errors,
      message: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
}

function loginRules() {
  return [
    body('account_email').trim().escape().notEmpty().isEmail().withMessage('Enter a valid email.'),
    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('Password is required.'),
  ];
}

async function checkLoginData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render('account/login', {
      title: 'Login',
      nav,
      errors,
      message: null,
      account_email: req.body.account_email || '',
    });
  }
  next();
}

function updateAccountRules() {
  return (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    const errors = [];
    
    // Validate first name
    if (!account_firstname || account_firstname.trim().length < 1) {
      errors.push({ msg: 'First name is required.' });
    }
    
    // Validate last name
    if (!account_lastname || account_lastname.trim().length < 1) {
      errors.push({ msg: 'Last name is required.' });
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!account_email || !emailRegex.test(account_email)) {
      errors.push({ msg: 'Valid email address is required.' });
    }
    
    req.validationErrors = errors;
    next();
  };
}

function checkUpdateData(req, res, next) {
  const errors = req.validationErrors || [];
  if (errors.length > 0) {
    req.flash('errors', errors);
    return res.status(400).render('account/update', {
      title: 'Update Account',
      nav: res.locals.nav || '',
      errors,
      message: null,
      account_firstname: req.body.account_firstname || '',
      account_lastname: req.body.account_lastname || '',
      account_email: req.body.account_email || '',
      account_id: req.body.account_id || ''
    });
  }
  next();
}

function updatePasswordRules() {
  return (req, res, next) => {
    const { account_password } = req.body;
    const errors = [];
    
    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;
    if (!account_password || !passwordRegex.test(account_password)) {
      errors.push({ 
        msg: 'Password must contain at least 12 characters with at least 1 capital letter, 1 number and 1 special character.' 
      });
    }
    
    req.validationErrors = errors;
    next();
  };
}

function checkPasswordData(req, res, next) {
  const errors = req.validationErrors || [];
  if (errors.length > 0) {
    req.flash('errors', errors);
    return res.status(400).render('account/update', {
      title: 'Update Account',
      nav: res.locals.nav || '',
      errors,
      message: null,
      account_firstname: '',
      account_lastname: '',
      account_email: '',
      account_id: req.body.account_id || ''
    });
  }
  next();
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
