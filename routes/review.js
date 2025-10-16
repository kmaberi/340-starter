// routes/review.js
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/review-controller")
const utilities = require("../utilities/")
const reviewValidate = require('../utilities/review-validation')

// Route to build add review form (login required)
router.get("/add/:inv_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildReviewForm)
)

// Process adding a new review (login required)
router.post(
  "/add",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to view user's reviews (login required)
router.get("/my-reviews", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildMyReviews)
)

// Route to build edit review form (login required)
router.get("/edit/:review_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReviewForm)
)

// Process editing a review (login required)
router.post(
  "/edit/:review_id",
  utilities.checkLogin,
  reviewValidate.updateReviewRules(),
  reviewValidate.checkUpdateReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

// Process deleting a review (login required)
router.post("/delete/:review_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

// Admin routes - moderate reviews (admin/employee only)
router.get("/admin", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.buildAdminReviews)
)

// Admin approve/reject review
router.post("/admin/:action/:review_id", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.approveReview)
)

module.exports = router
