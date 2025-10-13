// routes/account.js
const express = require('express');
const router = express.Router();

const utilities = require('../utilities');
const accountController = require('../controllers/account-controller'); // matches controllers/account-controller.js
const regValidate = require('../utilities/account-validation');

/* ---------------------------
   Public pages
   --------------------------- */

// Login page
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Registration page
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  '/register',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);


// Process login
router.post(
  '/login',
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* ---------------------------
   Protected pages (require login)
   --------------------------- */

// Account management (dashboard)
router.get(
  '/',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Build update view for a specific account
router.get(
  '/update/:account_id',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
);

// Process account update
router.post(
  '/update',
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process password update
router.post(
  '/update-password',
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Logout
router.get(
  '/logout',
  utilities.handleErrors(accountController.accountLogout)
);

module.exports = router;
