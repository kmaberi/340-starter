// controllers/account-controller.js
const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MESSAGE_KEY = 'notice'; // used in flash

async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const flash = req.flash(MESSAGE_KEY) || [];
    const message = flash.length ? flash[0] : null;
    res.render('account/login', { title: 'Login', nav, errors: null, message, account_email: '' });
  } catch (err) {
    next(err);
  }
}

async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const flash = req.flash(MESSAGE_KEY) || [];
    const message = flash.length ? flash[0] : null;
    res.render('account/register', { title: 'Register', nav, errors: null, message });
  } catch (err) {
    next(err);
  }
}

async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    if (!account_firstname || !account_lastname || !account_email || !account_password) {
      req.flash(MESSAGE_KEY, 'All fields are required.');
      return res.status(400).render('account/register', { title: 'Register', nav, errors: null, message: req.flash(MESSAGE_KEY)[0] });
    }

    // check if email exists
    const existing = await accountModel.getAccountByEmail(account_email.toLowerCase());
    if (existing) {
      req.flash(MESSAGE_KEY, 'An account with that email already exists.');
      return res.status(409).render('account/register', { title: 'Register', nav, errors: null, message: req.flash(MESSAGE_KEY)[0] });
    }

    const hashed = await bcrypt.hash(account_password, 10);
    const newAccount = await accountModel.registerAccount(account_firstname, account_lastname, account_email.toLowerCase(), hashed);
    if (newAccount) {
      req.flash(MESSAGE_KEY, `Registration successful — ${account_firstname}. Please log in.`);
      return res.status(201).render('account/login', { title: 'Login', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_email: account_email.toLowerCase() });
    } else {
      req.flash(MESSAGE_KEY, 'Registration failed.');
      return res.status(500).render('account/register', { title: 'Register', nav, errors: null, message: req.flash(MESSAGE_KEY)[0] });
    }
  } catch (err) {
    next(err);
  }
}

async function accountLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    if (!account_email || !account_password) {
      req.flash(MESSAGE_KEY, 'Both email and password are required.');
      return res.status(400).render('account/login', { title: 'Login', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_email: account_email || '' });
    }

    const account = await accountModel.getAccountByEmail(account_email.toLowerCase());
    if (!account) {
      req.flash(MESSAGE_KEY, 'Invalid credentials.');
      return res.status(401).render('account/login', { title: 'Login', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_email });
    }

    const match = await bcrypt.compare(account_password, account.account_password);
    if (!match) {
      req.flash(MESSAGE_KEY, 'Invalid credentials.');
      return res.status(401).render('account/login', { title: 'Login', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_email });
    }

    // remove password before token
    delete account.account_password;
    const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'devSecret', { expiresIn: '1h' });

    const cookieOpts = { httpOnly: true, maxAge: 1000 * 60 * 60, sameSite: 'lax' };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('jwt', token, cookieOpts);

    return res.redirect('/account');
  } catch (err) {
    next(err);
  }
}

async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account = res.locals.accountData || null;
    const message = (req.flash(MESSAGE_KEY) || []).length ? req.flash(MESSAGE_KEY)[0] : null;
    res.render('account/account-management', { title: 'Account Management', nav, errors: null, message, account });
  } catch (err) {
    next(err);
  }
}

async function buildAccountUpdate(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = Number(req.params.account_id);
    if (!account_id) throw new Error('Invalid account id');
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) throw new Error('Account not found');
    res.render('account/update', {
      title: 'Update Account',
      nav,
      errors: null,
      message: req.flash(MESSAGE_KEY)[0] || null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    });
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    if (!account_firstname || !account_lastname || !account_email || !account_id) {
      req.flash(MESSAGE_KEY, 'All fields are required.');
      return res.status(400).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_firstname, account_lastname, account_email, account_id });
    }

    // If email changed, ensure not used by another account
    const existing = await accountModel.getAccountByEmail(account_email.toLowerCase());
    if (existing && Number(existing.account_id) !== Number(account_id)) {
      req.flash(MESSAGE_KEY, 'Email already in use.');
      return res.status(409).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_firstname, account_lastname, account_email, account_id });
    }

    const updated = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email.toLowerCase());
    if (!updated) {
      req.flash(MESSAGE_KEY, 'Update failed.');
      return res.status(500).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_firstname, account_lastname, account_email, account_id });
    }

    // refresh token with new payload
    delete updated.account_password;
    const token = jwt.sign(updated, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'devSecret', { expiresIn: '1h' });
    const cookieOpts = { httpOnly: true, maxAge: 1000 * 60 * 60, sameSite: 'lax' };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('jwt', token, cookieOpts);

    req.flash(MESSAGE_KEY, 'Account updated.');
    return res.redirect('/account');
  } catch (err) {
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { current_password, account_password, account_id } = req.body;
    if (!current_password || !account_password || !account_id) {
      req.flash(MESSAGE_KEY, 'All fields are required.');
      return res.status(400).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0] });
    }

    const account = await accountModel.getAccountById(account_id);
    if (!account) {
      req.flash(MESSAGE_KEY, 'Account not found.');
      return res.status(404).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0] });
    }

    // verify current password
    const stored = await accountModel.getAccountByEmail(account.account_email);
    const ok = stored && await bcrypt.compare(current_password, stored.account_password);
    if (!ok) {
      req.flash(MESSAGE_KEY, 'Current password is incorrect.');
      return res.status(401).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_firstname: account.account_firstname, account_lastname: account.account_lastname, account_email: account.account_email, account_id: account.account_id });
    }

    const hashed = await bcrypt.hash(account_password, 10);
    const success = await accountModel.updatePassword(account_id, hashed);
    if (!success) {
      req.flash(MESSAGE_KEY, 'Password update failed.');
      return res.status(500).render('account/update', { title: 'Update Account', nav, errors: null, message: req.flash(MESSAGE_KEY)[0], account_firstname: account.account_firstname, account_lastname: account.account_lastname, account_email: account.account_email, account_id: account.account_id });
    }

    req.flash(MESSAGE_KEY, 'Password updated.');
    return res.redirect('/account');
  } catch (err) {
    next(err);
  }
}

async function accountLogout(req, res, next) {
  try {
    res.clearCookie('jwt');
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  accountLogout
};
