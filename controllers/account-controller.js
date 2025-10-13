const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* Deliver login view */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", { title: "Login", nav, errors: null });
  } catch (err) {
    next(err);
  }
}

/* Deliver registration view */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", { title: "Register", nav, errors: null });
  } catch (err) {
    next(err);
  }
}

/* Process Registration */
async function registerAccount(req, res, next) {
  let nav = "";
  try { nav = await utilities.getNav(); } catch (e) { console.error("nav load failed", e); }

  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  if (!account_firstname || !account_lastname || !account_email || !account_password) {
    req.flash("notice", "All fields are required.");
    return res.status(400).render("account/register", { title: "Registration", nav, errors: null });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email.toLowerCase(),
      hashedPassword
    );
    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", { title: "Login", nav, errors: null });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(500).render("account/register", { title: "Registration", nav, errors: null });
    }
  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
}

/* Process login request */
async function accountLogin(req, res, next) {
  let nav = "";
  try { nav = await utilities.getNav(); } catch (e) { console.error("nav load failed", e); }

  const { account_email, account_password } = req.body;
  if (!account_email || !account_password) {
    req.flash("notice", "Both email and password are required.");
    return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email: account_email || "" });
  }

  try {
    const accountData = await accountModel.getAccountByEmail(account_email.toLowerCase());
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(401).render("account/login", { title: "Login", nav, errors: null, account_email });
    }

    const passwordMatches = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatches) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(401).render("account/login", { title: "Login", nav, errors: null, account_email });
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    const cookieOptions = { httpOnly: true, maxAge: 1000 * 60 * 60, sameSite: 'lax' };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie("jwt", accessToken, cookieOptions);
    return res.redirect("/account/");
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
}

/* Deliver account management view */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account = res.locals.accountData || null;
    res.render("account/management", { title: "Account Management", nav, errors: null, account });
  } catch (err) {
    next(err);
  }
}

/* Deliver account update view */
async function buildAccountUpdate(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id, 10);
    if (Number.isNaN(account_id)) { const err = new Error("Invalid account id"); err.status = 400; throw err; }
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) { const err = new Error("Account not found"); err.status = 404; throw err; }
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  } catch (err) {
    next(err);
  }
}

/* Process account update */
async function updateAccount(req, res, next) {
  let nav = "";
  try { nav = await utilities.getNav(); } catch (e) { console.error("nav load failed", e); }

  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  if (!account_firstname || !account_lastname || !account_email || !account_id) {
    req.flash("notice", "All fields are required.");
    return res.status(400).render("account/update", { title: "Update Account", nav, errors: null, account_firstname, account_lastname, account_email, account_id });
  }

  try {
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email.toLowerCase());
    if (updateResult) {
      const accountData = await accountModel.getAccountById(account_id);
      if (accountData) delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      const cookieOptions = { httpOnly: true, maxAge: 1000 * 60 * 60, sameSite: 'lax' };
      if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
      res.cookie("jwt", accessToken, cookieOptions);
      req.flash("notice", "The account was successfully updated.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      return res.status(500).render("account/update", { title: "Update Account", nav, errors: null, account_firstname, account_lastname, account_email, account_id });
    }
  } catch (err) {
    console.error("Update account error:", err);
    next(err);
  }
}

/* Process password update */
async function updatePassword(req, res, next) {
  let nav = "";
  try { nav = await utilities.getNav(); } catch (e) { console.error("nav load failed", e); }

  const { current_password, account_password, account_id } = req.body;
  if (!current_password || !account_password || !account_id) {
    req.flash("notice", "All fields are required.");
    return res.status(400).render("account/update", { title: "Update Account", nav, errors: null });
  }

  try {
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.status(404).render("account/update", { title: "Update Account", nav, errors: null });
    }

    const stored = await accountModel.getAccountByEmail(accountData.account_email);
    const isCurrentPasswordValid = stored && await bcrypt.compare(current_password, stored.account_password);
    if (!isCurrentPasswordValid) {
      req.flash("notice", "Current password is incorrect.");
      return res.status(401).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id
      });
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "The password was successfully updated.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the password update failed.");
      return res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    next(error);
  }
}

/* Process logout */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt");
    return res.redirect("/");
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
  accountLogout,
};

/* ****************************************
*  Deliver account update view
**************************************** */
async function buildUpdateView(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

/* ****************************************
*  Process account update
**************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  
  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
*  Process password change
**************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  // Hash the password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }
  
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  
  if (updateResult) {
    req.flash("notice", "Password changed successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }
}

/* ****************************************
*  Process Logout
**************************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

module.exports = { 
  buildUpdateView, 
  updateAccount, 
  changePassword, 
  logout 
}
