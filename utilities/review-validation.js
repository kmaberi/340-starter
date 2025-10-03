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
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters."),

    // Review text is required
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),

    // Rating is required and must be between 1-5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // Inventory ID is required
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Valid vehicle ID is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to review addition
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_title, review_text, review_rating } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const inventoryModel = require("../models/inventoryModel")
    const vehicle = await inventoryModel.getVehicleById(inv_id)
    res.render("reviews/add-review", {
      errors,
      title: vehicle ? `Review ${vehicle.inv_make} ${vehicle.inv_model}` : "Add Review",
      nav,
      vehicle,
      review_title,
      review_text,
      review_rating,
    })
    return
  }
  next()
}

module.exports = validate