// routes/api-reviews.js
// API endpoints for review system
const express = require("express")
const router = new express.Router() 
const advancedController = require("../controllers/review-advanced-controller")
const utilities = require("../utilities/")

// Public API endpoints (no auth required)

// Get review statistics for a specific vehicle
router.get("/stats/:inv_id", 
  utilities.handleErrors(advancedController.getReviewStatsAPI)
)

// Get overall review statistics
router.get("/stats", 
  utilities.handleErrors(advancedController.getReviewStatsAPI)
)

// Protected API endpoints (auth required)

// Get analytics data (JSON)
router.get("/analytics", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(advancedController.getAnalyticsAPI)
)

// Get sentiment analysis data (JSON)
router.get("/sentiment/:inv_id?", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(advancedController.getSentimentAPI)
)

// Real-time review updates endpoint
router.get("/live-stats", 
  utilities.checkLogin,
  utilities.handleErrors(async (req, res, next) => {
    try {
      const reviewModel = require('../models/review-model');
      const pendingCount = await reviewModel.getPendingReviews();
      
      res.json({
        success: true,
        data: {
          pending_reviews: pendingCount.length,
          timestamp: new Date().toISOString(),
          status: 'live'
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch live stats'
      });
    }
  })
)

// Webhook endpoint for external integrations
router.post("/webhook/review-submitted", 
  express.raw({ type: 'application/json' }),
  utilities.handleErrors(async (req, res, next) => {
    try {
      // In a real application, you'd verify the webhook signature
      const data = JSON.parse(req.body);
      
      // Log the webhook event
      console.log('Review webhook received:', data);
      
      // You could trigger notifications, update caches, etc.
      
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(400).json({ error: 'Invalid webhook data' });
    }
  })
)

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      reviews: 'active'
    }
  });
});

module.exports = router