// Needed Resources 
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/review-controller")
const utilities = require("../utilities/")
const reviewValidate = require('../utilities/review-validation')

// Route to build add review view (login required)
router.get("/add/:inv_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildAddReview)
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

// Route to build edit review view (login required)
router.get("/edit/:review_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Process editing a review (login required)
router.post(
  "/edit",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.editReview)
)

// Process deleting a review (login required)
router.post("/delete", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

// Admin routes - moderate reviews (admin/employee only)
router.get("/admin", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.buildAdminReviews)
)

// Admin approve review
router.post("/admin/approve", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.approveReview)
)

// Admin reject review
router.post("/admin/reject", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.rejectReview)
)

module.exports = router