// routes/account.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account-controller');
const validate = require('../utilities/account-validation');
const utilities = require('../utilities');

// deliver account management - protected route (requires login)
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// register / login pages
router.get('/register', utilities.handleErrors(accountController.buildRegister));
router.post(
  '/register',
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.post(
  '/login',
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// account update / password (require login)
router.get('/update/:account_id', utilities.checkJWTToken, utilities.handleErrors(accountController.buildAccountUpdate));
router.post('/update/account', utilities.checkJWTToken, validate.updateAccountRules(), validate.checkUpdateData, utilities.handleErrors(accountController.updateAccount));
router.post('/update/password', utilities.checkJWTToken, validate.updatePasswordRules(), validate.checkPasswordData, utilities.handleErrors(accountController.updatePassword));

// logout
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

module.exports = router;
