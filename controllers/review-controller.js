/**
 * Minimal review-controller stub
 * Safe placeholder so the app can start.
 */

const utilities = require("../utilities");

async function buildReviewForm(req, res, next) {
  try {
    if (res.render) {
      return res.render('review/form', { title: 'Write a Review', message: req.flash ? req.flash('message') : null });
    }
    return res.status(200).send('Review form placeholder');
  } catch (err) {
    next(err);
  }
}

async function addReview(req, res, next) {
  try {
    req.flash && req.flash('message', 'Add review endpoint not implemented yet.');
    return res.redirect(req.get('Referer') || '/');
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    req.flash && req.flash('message', 'Delete review endpoint not implemented yet.');
    return res.redirect(req.get('Referer') || '/');
  } catch (err) {
    next(err);
  }
}

// Helpers used by other modules (return safe defaults)
async function getReviewsByVehicleId(invId) {
  return [];
}

async function getVehicleReviewStats(invId) {
  return { total_reviews: 0, avg_rating: 0 };
}

module.exports = {
  buildReviewForm,
  addReview,
  deleteReview,
  getReviewsByVehicleId,
  getVehicleReviewStats,
};
