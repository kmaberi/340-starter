const pool = require("../database/pool")

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(inv_id, account_id, review_title, review_text, review_rating) {
  try {
    const sql = `INSERT INTO public.review 
                 (inv_id, account_id, review_title, review_text, review_rating, review_date, review_approved) 
                 VALUES ($1, $2, $3, $4, $5, NOW(), false) RETURNING *`
    const result = await pool.query(sql, [inv_id, account_id, review_title, review_text, review_rating])
    return result.rowCount
  } catch (error) {
    console.error("addReview error: " + error)
    return error.message
  }
}

/* ***************************
 *  Get reviews by account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year, i.inv_color
                 FROM public.review r
                 INNER JOIN public.inventory i ON r.inv_id = i.inv_id
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    return error.message
  }
}

/* ***************************
 *  Get reviews by inventory ID (for vehicle detail page)
 * ************************** */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname
                 FROM public.review r
                 INNER JOIN public.account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1 AND r.review_approved = true
                 ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByVehicleId error: " + error)
    return error.message
  }
}

/* ***************************
 *  Get single review by ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year, i.inv_color, i.inv_id
                 FROM public.review r
                 INNER JOIN public.inventory i ON r.inv_id = i.inv_id
                 WHERE r.review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return error.message
  }
}

/* ***************************
 *  Check if user has already reviewed a vehicle
 * ************************** */
async function hasUserReviewed(inv_id, account_id) {
  try {
    const sql = `SELECT review_id FROM public.review 
                 WHERE inv_id = $1 AND account_id = $2`
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("hasUserReviewed error: " + error)
    return false
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(review_id, review_title, review_text, review_rating) {
  try {
    const sql = `UPDATE public.review 
                 SET review_title = $1, review_text = $2, review_rating = $3, review_approved = false
                 WHERE review_id = $4 RETURNING *`
    const result = await pool.query(sql, [review_title, review_text, review_rating, review_id])
    return result.rowCount
  } catch (error) {
    console.error("updateReview error: " + error)
    return error.message
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM public.review WHERE review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rowCount
  } catch (error) {
    console.error("deleteReview error: " + error)
    return error.message
  }
}

/* ***************************
 *  Get all reviews for admin (with user info)
 * ************************** */
async function getAllReviewsForAdmin() {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year, i.inv_color,
                        a.account_firstname, a.account_lastname, a.account_email
                 FROM public.review r
                 INNER JOIN public.inventory i ON r.inv_id = i.inv_id
                 INNER JOIN public.account a ON r.account_id = a.account_id
                 ORDER BY r.review_approved ASC, r.review_date DESC`
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    console.error("getAllReviewsForAdmin error: " + error)
    return error.message
  }
}

/* ***************************
 *  Toggle review approval status
 * ************************** */
async function toggleReviewApproval(review_id, is_approved) {
  try {
    const sql = `UPDATE public.review 
                 SET review_approved = $1 
                 WHERE review_id = $2 RETURNING *`
    const result = await pool.query(sql, [is_approved, review_id])
    return result.rowCount
  } catch (error) {
    console.error("toggleReviewApproval error: " + error)
    return error.message
  }
}

/* ***************************
 *  Get review statistics for a vehicle
 * ************************** */
async function getVehicleReviewStats(inv_id) {
  try {
    const sql = `SELECT 
                   COUNT(*) as total_reviews,
                   ROUND(AVG(review_rating), 1) as avg_rating,
                   COUNT(CASE WHEN review_rating = 5 THEN 1 END) as five_star,
                   COUNT(CASE WHEN review_rating = 4 THEN 1 END) as four_star,
                   COUNT(CASE WHEN review_rating = 3 THEN 1 END) as three_star,
                   COUNT(CASE WHEN review_rating = 2 THEN 1 END) as two_star,
                   COUNT(CASE WHEN review_rating = 1 THEN 1 END) as one_star
                 FROM public.review 
                 WHERE inv_id = $1 AND review_approved = true`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleReviewStats error: " + error)
    return error.message
  }
}

module.exports = {
  addReview,
  getReviewsByAccountId,
  getReviewsByVehicleId,
  getReviewById,
  hasUserReviewed,
  updateReview,
  deleteReview,
  getAllReviewsForAdmin,
  toggleReviewApproval,
  getVehicleReviewStats
}