// models/account-model.js
const db = require('../database');

/**
 * Get account by email
 * @param {string} email
 * @returns account row or null
 */
async function getAccountByEmail(email) {
  const sql = `SELECT * FROM public.account WHERE account_email = $1`;
  const values = [email];
  const result = await db.query(sql, values);
  return result && result.rows && result.rows[0] ? result.rows[0] : null;
}

/**
 * Get account by id
 * @param {number} id
 * @returns account row or null
 */
async function getAccountById(id) {
  const sql = `SELECT * FROM public.account WHERE account_id = $1`;
  const result = await db.query(sql, [id]);
  return result && result.rows && result.rows[0] ? result.rows[0] : null;
}

/**
 * Register new account
 * @returns inserted row
 */
async function registerAccount(firstname, lastname, email, hashedPassword) {
  const sql = `
    INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
    VALUES ($1, $2, $3, $4)
    RETURNING account_id, account_firstname, account_lastname, account_email, account_type
  `;
  const values = [firstname, lastname, email, hashedPassword];
  const result = await db.query(sql, values);
  return result && result.rows && result.rows[0] ? result.rows[0] : null;
}

/**
 * Update account info (firstname, lastname, email)
 */
async function updateAccount(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE public.account
    SET account_firstname = $1, account_lastname = $2, account_email = $3
    WHERE account_id = $4
    RETURNING account_id, account_firstname, account_lastname, account_email, account_type
  `;
  const values = [firstname, lastname, email, account_id];
  const result = await db.query(sql, values);
  return result && result.rows && result.rows[0] ? result.rows[0] : null;
}

/**
 * Update account password (hashed)
 */
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE public.account
    SET account_password = $1
    WHERE account_id = $2
    RETURNING account_id
  `;
  const result = await db.query(sql, [hashedPassword, account_id]);
  return result && result.rowCount === 1;
}

module.exports = {
  getAccountByEmail,
  getAccountById,
  registerAccount,
  updateAccount,
  updatePassword
};
