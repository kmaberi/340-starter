// models/review-model.js
const db = require('../database');

/**
 * Get all approved reviews for a specific vehicle
 * @param {number} inv_id - Vehicle inventory ID
 * @returns {Array} Array of approved reviews
 */
async function getReviewsByVehicleId(inv_id) {
  const sql = `
    SELECT 
      r.review_id,
      r.review_title,
      r.review_text,
      r.review_rating,
      r.review_date,
      a.account_firstname,
      a.account_lastname
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1 AND r.review_approved = TRUE
    ORDER BY r.review_date DESC
  `;
  const result = await db.query(sql, [inv_id]);
  return result.rows;
}

/**
 * Get all reviews by a specific user
 * @param {number} account_id - User account ID
 * @returns {Array} Array of user's reviews
 */
async function getReviewsByUserId(account_id) {
  const sql = `
    SELECT 
      r.review_id,
      r.review_title,
      r.review_text,
      r.review_rating,
      r.review_date,
      r.review_approved,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_id
    FROM public.review r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    WHERE r.account_id = $1
    ORDER BY r.review_date DESC
  `;
  const result = await db.query(sql, [account_id]);
  return result.rows;
}

/**
 * Get a single review by ID
 * @param {number} review_id - Review ID
 * @returns {Object} Review object or null
 */
async function getReviewById(review_id) {
  const sql = `
    SELECT 
      r.review_id,
      r.inv_id,
      r.account_id,
      r.review_title,
      r.review_text,
      r.review_rating,
      r.review_date,
      r.review_approved,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      a.account_firstname,
      a.account_lastname
    FROM public.review r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.review_id = $1
  `;
  const result = await db.query(sql, [review_id]);
  return result.rows[0] || null;
}

/**
 * Create a new review
 * @param {Object} reviewData - Review data object
 * @returns {Object} Created review or null
 */
async function createReview(reviewData) {
  const { inv_id, account_id, review_title, review_text, review_rating } = reviewData;
  const sql = `
    INSERT INTO public.review (inv_id, account_id, review_title, review_text, review_rating)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING review_id, review_date, review_approved
  `;
  const values = [inv_id, account_id, review_title, review_text, review_rating];
  const result = await db.query(sql, values);
  return result.rows[0] || null;
}

/**
 * Update an existing review
 * @param {number} review_id - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Object} Updated review or null
 */
async function updateReview(review_id, reviewData) {
  const { review_title, review_text, review_rating } = reviewData;
  const sql = `
    UPDATE public.review 
    SET review_title = $1, review_text = $2, review_rating = $3
    WHERE review_id = $4
    RETURNING review_id, review_date, review_approved
  `;
  const values = [review_title, review_text, review_rating, review_id];
  const result = await db.query(sql, values);
  return result.rows[0] || null;
}

/**
 * Delete a review
 * @param {number} review_id - Review ID
 * @returns {boolean} True if deleted, false otherwise
 */
async function deleteReview(review_id) {
  const sql = `DELETE FROM public.review WHERE review_id = $1`;
  const result = await db.query(sql, [review_id]);
  return result.rowCount === 1;
}

/**
 * Check if user already reviewed a vehicle
 * @param {number} inv_id - Vehicle inventory ID
 * @param {number} account_id - User account ID
 * @returns {boolean} True if user has already reviewed this vehicle
 */
async function hasUserReviewedVehicle(inv_id, account_id) {
  const sql = `
    SELECT review_id 
    FROM public.review 
    WHERE inv_id = $1 AND account_id = $2
  `;
  const result = await db.query(sql, [inv_id, account_id]);
  return result.rows.length > 0;
}

/**
 * Get vehicle review statistics
 * @param {number} inv_id - Vehicle inventory ID
 * @returns {Object} Review statistics
 */
async function getVehicleReviewStats(inv_id) {
  const sql = `
    SELECT 
      COUNT(*) as total_reviews,
      ROUND(AVG(review_rating), 1) as avg_rating,
      COUNT(CASE WHEN review_rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN review_rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN review_rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN review_rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN review_rating = 1 THEN 1 END) as one_star
    FROM public.review 
    WHERE inv_id = $1 AND review_approved = TRUE
  `;
  const result = await db.query(sql, [inv_id]);
  return result.rows[0] || { total_reviews: 0, avg_rating: 0 };
}

/**
 * Get all pending reviews (for admin approval)
 * @returns {Array} Array of pending reviews
 */
async function getPendingReviews() {
  const sql = `
    SELECT 
      r.review_id,
      r.review_title,
      r.review_text,
      r.review_rating,
      r.review_date,
      a.account_firstname,
      a.account_lastname,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_id
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    JOIN public.inventory i ON r.inv_id = i.inv_id
    WHERE r.review_approved = FALSE
    ORDER BY r.review_date ASC
  `;
  const result = await db.query(sql);
  return result.rows;
}

/**
 * Approve or reject a review
 * @param {number} review_id - Review ID
 * @param {boolean} approved - Approval status
 * @returns {boolean} True if updated successfully
 */
async function updateReviewApproval(review_id, approved) {
  const sql = `
    UPDATE public.review 
    SET review_approved = $1
    WHERE review_id = $2
  `;
  const result = await db.query(sql, [approved, review_id]);
  return result.rowCount === 1;
}

/**
 * Check if user owns a review
 * @param {number} review_id - Review ID
 * @param {number} account_id - User account ID
 * @returns {boolean} True if user owns the review
 */
async function isReviewOwner(review_id, account_id) {
  const sql = `
    SELECT review_id 
    FROM public.review 
    WHERE review_id = $1 AND account_id = $2
  `;
  const result = await db.query(sql, [review_id, account_id]);
  return result.rows.length > 0;
}

module.exports = {
  getReviewsByVehicleId,
  getReviewsByUserId,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  hasUserReviewedVehicle,
  getVehicleReviewStats,
  getPendingReviews,
  updateReviewApproval,
  isReviewOwner
};