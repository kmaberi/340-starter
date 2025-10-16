// controllers/review-advanced-controller.js
// Advanced review management features
const utilities = require('../utilities');
const reviewModel = require('../models/review-model');
const reviewAnalyticsModel = require('../models/review-analytics-model');
const inventoryModel = require('../models/inventory-model');

const MESSAGE_KEY = 'notice';

/**
 * Build advanced analytics dashboard
 */
async function buildAnalyticsDashboard(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const analytics = await reviewAnalyticsModel.getReviewAnalytics();
    const message = req.flash(MESSAGE_KEY)[0] || null;

    res.render('reviews/analytics-dashboard', {
      title: 'Review Analytics Dashboard',
      nav,
      analytics,
      message
    });
  } catch (err) {
    console.error('buildAnalyticsDashboard error:', err);
    next(err);
  }
}

/**
 * Build advanced review management with filtering
 */
async function buildAdvancedReviewManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash(MESSAGE_KEY)[0] || null;
    
    // Extract query parameters
    const filters = {
      rating_min: parseInt(req.query.rating_min) || 1,
      rating_max: parseInt(req.query.rating_max) || 5,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null,
      approved_status: req.query.approved_status !== undefined ? req.query.approved_status === 'true' : undefined,
      make: req.query.make || null,
      model: req.query.model || null,
      search_term: req.query.search || null
    };
    
    const sorting = {
      sort_by: req.query.sort_by || 'review_date',
      sort_order: req.query.sort_order || 'DESC'
    };
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await reviewAnalyticsModel.getAdvancedReviews(filters, sorting, pagination);
    
    // Get unique makes for filter dropdown
    const makesQuery = await utilities.handleErrors(async () => {
      const sql = 'SELECT DISTINCT inv_make FROM public.inventory ORDER BY inv_make';
      const db = require('../database');
      const result = await db.query(sql);
      return result.rows.map(row => row.inv_make);
    })();
    
    res.render('reviews/advanced-management', {
      title: 'Advanced Review Management',
      nav,
      reviews: result.reviews,
      pagination: result.pagination,
      filters,
      sorting,
      makes: makesQuery || [],
      message
    });
  } catch (err) {
    console.error('buildAdvancedReviewManagement error:', err);
    next(err);
  }
}

/**
 * Process bulk review operations
 */
async function processBulkReviewAction(req, res, next) {
  try {
    const { action, review_ids } = req.body;
    
    if (!Array.isArray(review_ids) || review_ids.length === 0) {
      req.flash(MESSAGE_KEY, 'Please select at least one review.');
      return res.redirect('/reviews/advanced-management');
    }
    
    let result;
    switch (action) {
      case 'approve':
        result = await reviewAnalyticsModel.bulkUpdateReviewStatus(review_ids, true);
        req.flash(MESSAGE_KEY, `Successfully approved ${result.updated_count} reviews.`);
        break;
      case 'reject':
        result = await reviewAnalyticsModel.bulkUpdateReviewStatus(review_ids, false);
        req.flash(MESSAGE_KEY, `Successfully rejected ${result.updated_count} reviews.`);
        break;
      case 'delete':
        // Bulk delete implementation
        const deletePromises = review_ids.map(id => reviewModel.deleteReview(parseInt(id)));
        const deleteResults = await Promise.all(deletePromises);
        const deletedCount = deleteResults.filter(Boolean).length;
        req.flash(MESSAGE_KEY, `Successfully deleted ${deletedCount} reviews.`);
        break;
      default:
        req.flash(MESSAGE_KEY, 'Invalid bulk action selected.');
    }
    
    return res.redirect('/reviews/advanced-management');
  } catch (err) {
    console.error('processBulkReviewAction error:', err);
    req.flash(MESSAGE_KEY, 'An error occurred while processing bulk action.');
    return res.redirect('/reviews/advanced-management');
  }
}

/**
 * Build sentiment analysis view
 */
async function buildSentimentAnalysis(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const inv_id = req.params.inv_id ? parseInt(req.params.inv_id) : null;
    const message = req.flash(MESSAGE_KEY)[0] || null;
    
    const sentimentData = await reviewAnalyticsModel.getReviewSentimentAnalysis(inv_id);
    
    let vehicle = null;
    if (inv_id) {
      vehicle = await inventoryModel.getVehicleById(inv_id);
    }
    
    res.render('reviews/sentiment-analysis', {
      title: vehicle ? `Sentiment Analysis - ${vehicle.inv_make} ${vehicle.inv_model}` : 'Review Sentiment Analysis',
      nav,
      sentimentData,
      vehicle,
      message
    });
  } catch (err) {
    console.error('buildSentimentAnalysis error:', err);
    next(err);
  }
}

/**
 * Build comparative ratings view
 */
async function buildComparativeRatings(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const make = req.params.make || req.query.make;
    const message = req.flash(MESSAGE_KEY)[0] || null;
    
    if (!make) {
      req.flash(MESSAGE_KEY, 'Please select a vehicle make to compare.');
      return res.redirect('/reviews/analytics');
    }
    
    const comparativeData = await reviewAnalyticsModel.getComparativeVehicleRatings(make);
    
    res.render('reviews/comparative-ratings', {
      title: `Comparative Ratings - ${make}`,
      nav,
      make,
      comparativeData,
      message
    });
  } catch (err) {
    console.error('buildComparativeRatings error:', err);
    next(err);
  }
}

/**
 * API endpoint for review analytics data (JSON)
 */
async function getAnalyticsAPI(req, res, next) {
  try {
    const analytics = await reviewAnalyticsModel.getReviewAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('getAnalyticsAPI error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
}

/**
 * API endpoint for sentiment analysis data (JSON)
 */
async function getSentimentAPI(req, res, next) {
  try {
    const inv_id = req.params.inv_id ? parseInt(req.params.inv_id) : null;
    const sentimentData = await reviewAnalyticsModel.getReviewSentimentAnalysis(inv_id);
    
    res.json({
      success: true,
      data: sentimentData
    });
  } catch (err) {
    console.error('getSentimentAPI error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sentiment data'
    });
  }
}

/**
 * Export reviews to CSV
 */
async function exportReviewsCSV(req, res, next) {
  try {
    const filters = {
      rating_min: parseInt(req.query.rating_min) || 1,
      rating_max: parseInt(req.query.rating_max) || 5,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null,
      approved_status: req.query.approved_status !== undefined ? req.query.approved_status === 'true' : undefined,
      make: req.query.make || null,
      model: req.query.model || null,
      search_term: req.query.search || null
    };
    
    const result = await reviewAnalyticsModel.getAdvancedReviews(filters, { sort_by: 'review_date', sort_order: 'DESC' }, { limit: 10000 });
    
    // Generate CSV content
    const csvHeader = 'ID,Title,Rating,Date,Vehicle Make,Vehicle Model,Vehicle Year,Reviewer Name,Review Text,Approved\\n';
    const csvRows = result.reviews.map(review => {
      const cleanText = (review.review_text || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanTitle = (review.review_title || '').replace(/"/g, '""');
      return `${review.review_id},"${cleanTitle}",${review.review_rating},"${new Date(review.review_date).toISOString()}","${review.inv_make}","${review.inv_model}",${review.inv_year},"${review.account_firstname} ${review.account_lastname}","${cleanText}",${review.review_approved}`;
    }).join('\\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reviews-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('exportReviewsCSV error:', err);
    req.flash(MESSAGE_KEY, 'Failed to export reviews.');
    res.redirect('/reviews/advanced-management');
  }
}

/**
 * Build review notification settings
 */
async function buildNotificationSettings(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash(MESSAGE_KEY)[0] || null;
    
    // In a real application, you'd fetch user notification preferences
    const settings = {
      email_new_review: true,
      email_review_approved: true,
      email_review_reply: false,
      daily_digest: true,
      weekly_summary: false
    };
    
    res.render('reviews/notification-settings', {
      title: 'Review Notification Settings',
      nav,
      settings,
      message
    });
  } catch (err) {
    console.error('buildNotificationSettings error:', err);
    next(err);
  }
}

/**
 * Real-time review statistics for AJAX calls
 */
async function getReviewStatsAPI(req, res, next) {
  try {
    const inv_id = req.params.inv_id ? parseInt(req.params.inv_id) : null;
    
    if (inv_id) {
      const stats = await reviewModel.getVehicleReviewStats(inv_id);
      const reviews = await reviewModel.getReviewsByVehicleId(inv_id);
      
      res.json({
        success: true,
        data: {
          ...stats,
          recent_reviews: reviews.slice(0, 3)
        }
      });
    } else {
      const analytics = await reviewAnalyticsModel.getReviewAnalytics();
      res.json({
        success: true,
        data: analytics.stats
      });
    }
  } catch (err) {
    console.error('getReviewStatsAPI error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review statistics'
    });
  }
}

module.exports = {
  buildAnalyticsDashboard,
  buildAdvancedReviewManagement,
  processBulkReviewAction,
  buildSentimentAnalysis,
  buildComparativeRatings,
  getAnalyticsAPI,
  getSentimentAPI,
  exportReviewsCSV,
  buildNotificationSettings,
  getReviewStatsAPI
};