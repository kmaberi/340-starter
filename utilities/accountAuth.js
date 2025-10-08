// utilities/accountAuth.js
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'change_this_secret';

// middleware to populate res.locals.accountData if token present & valid
function checkJwtCookie(req, res, next) {
  try {
    const token = req.cookies?.token; // adjust cookie name if different
    if (!token) {
      res.locals.accountData = null;
      return next();
    }

    const payload = jwt.verify(token, jwtSecret);
    // payload should contain account_id, account_type, firstname, etc.
    res.locals.accountData = payload;
    return next();
  } catch (err) {
    // invalid token — treat as not logged in
    res.locals.accountData = null;
    return next();
  }
}

// middleware to restrict to Employee or Admin
function onlyAllowEmployeesAndAdmins(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      req.flash('error', 'You must be logged in to access that page.');
      return res.status(401).render('account/login', { title: 'Login', message: 'Please login to continue' });
    }
    const payload = jwt.verify(token, jwtSecret);
    const accountType = payload.account_type || payload.accountType || payload.type;
    if (accountType === 'Employee' || accountType === 'Admin') {
      res.locals.accountData = payload;
      return next();
    }
    // not authorized
    req.flash('error', 'You are not authorized to access that resource.');
    return res.status(403).render('account/login', { title: 'Login', message: 'You are not authorized' });
  } catch (err) {
    req.flash('error', 'Authentication failed. Please log in again.');
    return res.status(401).render('account/login', { title: 'Login', message: 'Authentication failed' });
  }
}

module.exports = {
  checkJwtCookie,
  onlyAllowEmployeesAndAdmins,
};
