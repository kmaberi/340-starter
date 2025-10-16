// utilities/review-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Review title is required and must be string
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Review title is required.")
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters."),

    // Review text is required
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Review text is required.")
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review must be between 10 and 2000 characters."),

    // Rating is required and must be between 1-5
    body("review_rating")
      .notEmpty()
      .withMessage("Rating is required.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // Inventory ID is required
    body("inv_id")
      .notEmpty()
      .withMessage("Vehicle ID is required.")
      .isInt({ min: 1 })
      .withMessage("Valid vehicle ID is required."),
  ]
}

/* ******************************
 * Update review validation rules (no inv_id required)
 * ***************************** */
validate.updateReviewRules = () => {
  return [
    // Review title is required and must be string
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Review title is required.")
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters."),

    // Review text is required
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Review text is required.")
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review must be between 10 and 2000 characters."),

    // Rating is required and must be between 1-5
    body("review_rating")
      .notEmpty()
      .withMessage("Rating is required.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),
  ]
}

/* ******************************
 * Check data and return errors or continue to review addition
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_title, review_text, review_rating } = req.body
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    try {
      let nav = await utilities.getNav()
      const inventoryModel = require("../models/inventory-model")
      const vehicle = await inventoryModel.getVehicleById(inv_id)
      
      return res.status(400).render("reviews/add-review", {
        errors,
        title: vehicle ? `Review ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}` : "Add Review",
        nav,
        vehicle,
        review_title: review_title || '',
        review_text: review_text || '',
        review_rating: review_rating || 5,
        message: null
      })
    } catch (err) {
      console.error('Error in checkReviewData:', err)
      return next(err)
    }
  }
  next()
}

/* ******************************
 * Check update data and return errors or continue to review update
 * ***************************** */
validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_title, review_text, review_rating } = req.body
  const review_id = parseInt(req.params.review_id)
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    try {
      let nav = await utilities.getNav()
      const reviewModel = require("../models/review-model")
      const review = await reviewModel.getReviewById(review_id)
      
      if (!review) {
        req.flash('notice', 'Review not found.')
        return res.redirect('/account')
      }
      
      return res.status(400).render("reviews/edit-review", {
        errors,
        title: `Edit Review - ${review.inv_year} ${review.inv_make} ${review.inv_model}`,
        nav,
        review: {
          ...review,
          review_title: review_title || review.review_title,
          review_text: review_text || review.review_text,
          review_rating: review_rating || review.review_rating
        },
        message: null
      })
    } catch (err) {
      console.error('Error in checkUpdateReviewData:', err)
      return next(err)
    }
  }
  next()
}

/* ******************************
 * Server-side validation helper
 * ***************************** */
validate.validateReviewData = (reviewData) => {
  const errors = []
  
  // Validate title
  if (!reviewData.review_title || reviewData.review_title.trim().length < 5) {
    errors.push({ msg: 'Review title must be at least 5 characters long.' })
  }
  if (reviewData.review_title && reviewData.review_title.length > 100) {
    errors.push({ msg: 'Review title must be no more than 100 characters.' })
  }
  
  // Validate text
  if (!reviewData.review_text || reviewData.review_text.trim().length < 10) {
    errors.push({ msg: 'Review text must be at least 10 characters long.' })
  }
  if (reviewData.review_text && reviewData.review_text.length > 2000) {
    errors.push({ msg: 'Review text must be no more than 2000 characters.' })
  }
  
  // Validate rating
  const rating = parseInt(reviewData.review_rating)
  if (!rating || rating < 1 || rating > 5) {
    errors.push({ msg: 'Rating must be between 1 and 5 stars.' })
  }
  
  return errors
}

module.exports = validate
