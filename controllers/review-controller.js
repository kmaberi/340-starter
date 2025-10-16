// controllers/review-controller.js
const utilities = require('../utilities');
const reviewModel = require('../models/review-model');
const inventoryModel = require('../models/inventory-model');

const MESSAGE_KEY = 'notice';

/**
 * Build review form for a specific vehicle
 */
async function buildReviewForm(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const inv_id = parseInt(req.params.inv_id);
    
    if (!inv_id) {
      req.flash(MESSAGE_KEY, 'Invalid vehicle ID.');
      return res.redirect('/');
    }

    const vehicle = await inventoryModel.getVehicleById(inv_id);
    if (!vehicle) {
      req.flash(MESSAGE_KEY, 'Vehicle not found.');
      return res.redirect('/');
    }

    // Check if user already reviewed this vehicle
    if (res.locals.accountData) {
      const hasReviewed = await reviewModel.hasUserReviewedVehicle(inv_id, res.locals.accountData.account_id);
      if (hasReviewed) {
        req.flash(MESSAGE_KEY, 'You have already reviewed this vehicle.');
        return res.redirect(`/inv/detail/${inv_id}`);
      }
    }

    const message = req.flash(MESSAGE_KEY)[0] || null;
    res.render('reviews/add-review', {
      title: `Review ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      errors: null,
      message,
      review_title: '',
      review_text: '',
      review_rating: 5
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Process new review submission
 */
async function addReview(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { inv_id, review_title, review_text, review_rating } = req.body;
    const account_id = res.locals.accountData ? res.locals.accountData.account_id : null;

    if (!account_id) {
      req.flash(MESSAGE_KEY, 'You must be logged in to write a review.');
      return res.redirect('/account/login');
    }

    // Get vehicle info for rendering
    const vehicle = await inventoryModel.getVehicleById(inv_id);
    if (!vehicle) {
      req.flash(MESSAGE_KEY, 'Vehicle not found.');
      return res.redirect('/');
    }

    // Check if user already reviewed this vehicle
    const hasReviewed = await reviewModel.hasUserReviewedVehicle(inv_id, account_id);
    if (hasReviewed) {
      req.flash(MESSAGE_KEY, 'You have already reviewed this vehicle.');
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const reviewData = {
      inv_id: parseInt(inv_id),
      account_id,
      review_title: review_title.trim(),
      review_text: review_text.trim(),
      review_rating: parseInt(review_rating)
    };

    const result = await reviewModel.createReview(reviewData);
    if (result) {
      req.flash(MESSAGE_KEY, 'Review submitted successfully! It will be visible once approved.');
      return res.redirect(`/inv/detail/${inv_id}`);
    } else {
      req.flash(MESSAGE_KEY, 'Failed to submit review. Please try again.');
      return res.status(500).render('reviews/add-review', {
        title: `Review ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        vehicle,
        errors: null,
        message: req.flash(MESSAGE_KEY)[0],
        review_title,
        review_text,
        review_rating
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Build edit review form
 */
async function buildEditReviewForm(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const review_id = parseInt(req.params.review_id);
    
    const review = await reviewModel.getReviewById(review_id);
    if (!review) {
      req.flash(MESSAGE_KEY, 'Review not found.');
      return res.redirect('/account');
    }

    // Check if user owns this review
    if (!res.locals.accountData || review.account_id !== res.locals.accountData.account_id) {
      req.flash(MESSAGE_KEY, 'You can only edit your own reviews.');
      return res.redirect('/account');
    }

    const message = req.flash(MESSAGE_KEY)[0] || null;
    res.render('reviews/edit-review', {
      title: `Edit Review - ${review.inv_year} ${review.inv_make} ${review.inv_model}`,
      nav,
      review,
      errors: null,
      message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Process review update
 */
async function updateReview(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const review_id = parseInt(req.params.review_id);
    const { review_title, review_text, review_rating } = req.body;
    
    const review = await reviewModel.getReviewById(review_id);
    if (!review) {
      req.flash(MESSAGE_KEY, 'Review not found.');
      return res.redirect('/account');
    }

    // Check if user owns this review
    if (!res.locals.accountData || review.account_id !== res.locals.accountData.account_id) {
      req.flash(MESSAGE_KEY, 'You can only edit your own reviews.');
      return res.redirect('/account');
    }

    const reviewData = {
      review_title: review_title.trim(),
      review_text: review_text.trim(),
      review_rating: parseInt(review_rating)
    };

    const result = await reviewModel.updateReview(review_id, reviewData);
    if (result) {
      req.flash(MESSAGE_KEY, 'Review updated successfully!');
      return res.redirect('/reviews/my-reviews');
    } else {
      req.flash(MESSAGE_KEY, 'Failed to update review.');
      return res.status(500).render('reviews/edit-review', {
        title: `Edit Review - ${review.inv_year} ${review.inv_make} ${review.inv_model}`,
        nav,
        review: { ...review, ...reviewData },
        errors: null,
        message: req.flash(MESSAGE_KEY)[0]
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a review
 */
async function deleteReview(req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id);
    
    const review = await reviewModel.getReviewById(review_id);
    if (!review) {
      req.flash(MESSAGE_KEY, 'Review not found.');
      return res.redirect('/account');
    }

    // Check if user owns this review or is admin/employee
    const accountData = res.locals.accountData;
    if (!accountData || 
        (review.account_id !== accountData.account_id && 
         accountData.account_type !== 'Admin' && 
         accountData.account_type !== 'Employee')) {
      req.flash(MESSAGE_KEY, 'You do not have permission to delete this review.');
      return res.redirect('/account');
    }

    const result = await reviewModel.deleteReview(review_id);
    if (result) {
      req.flash(MESSAGE_KEY, 'Review deleted successfully.');
    } else {
      req.flash(MESSAGE_KEY, 'Failed to delete review.');
    }
    
    return res.redirect('/reviews/my-reviews');
  } catch (err) {
    next(err);
  }
}

/**
 * Display user's reviews
 */
async function buildMyReviews(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = res.locals.accountData ? res.locals.accountData.account_id : null;

    if (!account_id) {
      req.flash(MESSAGE_KEY, 'You must be logged in to view your reviews.');
      return res.redirect('/account/login');
    }

    const reviews = await reviewModel.getReviewsByUserId(account_id);
    const message = req.flash(MESSAGE_KEY)[0] || null;

    res.render('reviews/my-reviews', {
      title: 'My Reviews',
      nav,
      reviews,
      message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin review management
 */
async function buildAdminReviews(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const pendingReviews = await reviewModel.getPendingReviews();
    const message = req.flash(MESSAGE_KEY)[0] || null;

    res.render('reviews/admin-reviews', {
      title: 'Review Management',
      nav,
      pendingReviews,
      message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve or reject a review
 */
async function approveReview(req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id);
    const action = req.params.action; // 'approve' or 'reject'

    if (action === 'approve') {
      const result = await reviewModel.updateReviewApproval(review_id, true);
      if (result) {
        req.flash(MESSAGE_KEY, 'Review approved successfully.');
      } else {
        req.flash(MESSAGE_KEY, 'Failed to approve review.');
      }
    } else if (action === 'reject') {
      const result = await reviewModel.deleteReview(review_id);
      if (result) {
        req.flash(MESSAGE_KEY, 'Review rejected and deleted.');
      } else {
        req.flash(MESSAGE_KEY, 'Failed to reject review.');
      }
    }

    return res.redirect('/reviews/admin');
  } catch (err) {
    next(err);
  }
}

// Helper functions for use by other controllers

/**
 * Get reviews for a vehicle (for use in inventory detail page)
 */
async function getReviewsByVehicleId(inv_id) {
  try {
    return await reviewModel.getReviewsByVehicleId(inv_id);
  } catch (err) {
    console.error('Error getting reviews by vehicle ID:', err);
    return [];
  }
}

/**
 * Get review statistics for a vehicle
 */
async function getVehicleReviewStats(inv_id) {
  try {
    return await reviewModel.getVehicleReviewStats(inv_id);
  } catch (err) {
    console.error('Error getting vehicle review stats:', err);
    return { total_reviews: 0, avg_rating: 0 };
  }
}

/**
 * Generate review stars HTML
 */
function generateStarsHTML(rating, total_reviews = null) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<span class="star star-full">★</span>';
  }
  
  // Half star
  if (hasHalfStar) {
    starsHTML += '<span class="star star-half">★</span>';
  }
  
  // Empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<span class="star star-empty">☆</span>';
  }
  
  if (total_reviews !== null) {
    starsHTML += ` <span class="rating-text">(${rating}/5 from ${total_reviews} reviews)</span>`;
  }
  
  return starsHTML;
}

module.exports = {
  buildReviewForm,
  addReview,
  buildEditReviewForm,
  updateReview,
  deleteReview,
  buildMyReviews,
  buildAdminReviews,
  approveReview,
  getReviewsByVehicleId,
  getVehicleReviewStats,
  generateStarsHTML
};
