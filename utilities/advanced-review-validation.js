// utilities/advanced-review-validation.js
// Advanced validation and security for review system
const { body, query, validationResult } = require('express-validator');
const utilities = require('.');

/**
 * Advanced review validation with content filtering
 */
function advancedReviewRules() {
  return [
    body('review_title')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Review title is required.')
      .isLength({ min: 5, max: 100 })
      .withMessage('Review title must be between 5-100 characters.')
      .matches(/^[a-zA-Z0-9\s\-.,!?'"()]+$/)
      .withMessage('Review title contains invalid characters.')
      .custom(value => {
        // Check for spam/inappropriate content
        const spamKeywords = ['spam', 'fake', 'bot', 'advertisement'];
        const lowerValue = value.toLowerCase();
        const hasSpam = spamKeywords.some(keyword => lowerValue.includes(keyword));
        if (hasSpam) {
          throw new Error('Review title contains inappropriate content.');
        }
        return true;
      }),

    body('review_text')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Review text is required.')
      .isLength({ min: 20, max: 2000 })
      .withMessage('Review must be between 20-2000 characters.')
      .custom(value => {
        // Advanced content validation
        const inappropriateWords = ['spam', 'fake', 'scam', 'terrible service'];
        const lowerValue = value.toLowerCase();
        
        // Check for repeated characters (spam indicator)
        if (/(.)\1{4,}/.test(value)) {
          throw new Error('Review contains excessive repeated characters.');
        }
        
        // Check for URLs (prevent spam)
        if (/https?:\/\/|www\.|\.com|\.org|\.net/i.test(value)) {
          throw new Error('Reviews cannot contain URLs or links.');
        }
        
        // Check for excessive punctuation
        if ((value.match(/[!?]/g) || []).length > 5) {
          throw new Error('Review contains excessive punctuation.');
        }
        
        // Check for all caps (shouting)
        const capsRatio = (value.match(/[A-Z]/g) || []).length / value.length;
        if (capsRatio > 0.7 && value.length > 20) {
          throw new Error('Please avoid writing in all capitals.');
        }
        
        return true;
      }),

    body('review_rating')
      .notEmpty()
      .withMessage('Rating is required.')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5 stars.')
      .custom((value, { req }) => {
        // Detect suspicious rating patterns
        const rating = parseInt(value);
        const title = req.body.review_title || '';
        const text = req.body.review_text || '';
        
        // Check for mismatched rating and content
        const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect'];
        const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'horrible'];
        
        const positiveCount = positiveWords.filter(word => 
          text.toLowerCase().includes(word) || title.toLowerCase().includes(word)
        ).length;
        
        const negativeCount = negativeWords.filter(word => 
          text.toLowerCase().includes(word) || title.toLowerCase().includes(word)
        ).length;
        
        // Flag suspicious mismatches
        if (rating >= 4 && negativeCount > positiveCount && negativeCount > 2) {
          throw new Error('Rating seems inconsistent with review content.');
        }
        
        if (rating <= 2 && positiveCount > negativeCount && positiveCount > 2) {
          throw new Error('Rating seems inconsistent with review content.');
        }
        
        return true;
      }),

    body('inv_id')
      .notEmpty()
      .withMessage('Vehicle ID is required.')
      .isInt({ min: 1 })
      .withMessage('Valid vehicle ID is required.')
      .custom(async (value) => {
        // Verify vehicle exists
        try {
          const inventoryModel = require('../models/inventory-model');
          const vehicle = await inventoryModel.getVehicleById(value);
          if (!vehicle) {
            throw new Error('Vehicle not found.');
          }
          return true;
        } catch (err) {
          throw new Error('Invalid vehicle ID.');
        }
      })
  ];
}

/**
 * Rate limiting validation middleware
 */
function reviewRateLimitValidation() {
  return async (req, res, next) => {
    const accountId = res.locals.accountData?.account_id;
    
    if (!accountId) {
      return next();
    }
    
    try {
      // Check recent review submissions (last 24 hours)
      const reviewModel = require('../models/review-model');
      const recentReviews = await reviewModel.getReviewsByUserId(accountId);
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCount = recentReviews.filter(review => 
        new Date(review.review_date) > oneDayAgo
      ).length;
      
      if (recentCount >= 3) {
        req.flash('notice', 'You have reached the daily review limit. Please try again tomorrow.');
        return res.redirect('/reviews/my-reviews');
      }
      
      next();
    } catch (err) {
      console.error('Rate limit check error:', err);
      next(); // Continue on error
    }
  };
}

/**
 * Advanced search and filter validation
 */
function advancedFilterRules() {
  return [
    query('rating_min')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Minimum rating must be between 1-5.'),
      
    query('rating_max')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Maximum rating must be between 1-5.')
      .custom((value, { req }) => {
        const min = parseInt(req.query.rating_min || 1);
        const max = parseInt(value);
        if (max < min) {
          throw new Error('Maximum rating must be greater than minimum rating.');
        }
        return true;
      }),
      
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format.')
      .custom(value => {
        const date = new Date(value);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (date < oneYearAgo) {
          throw new Error('Start date cannot be more than one year ago.');
        }
        return true;
      }),
      
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format.')
      .custom((value, { req }) => {
        if (req.query.date_from) {
          const startDate = new Date(req.query.date_from);
          const endDate = new Date(value);
          
          if (endDate < startDate) {
            throw new Error('End date must be after start date.');
          }
          
          // Limit date range to 1 year
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          if (endDate - startDate > oneYear) {
            throw new Error('Date range cannot exceed one year.');
          }
        }
        return true;
      }),
      
    query('search')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be 2-100 characters.')
      .matches(/^[a-zA-Z0-9\s\-.,!?'"()]+$/)
      .withMessage('Search term contains invalid characters.'),
      
    query('make')
      .optional()
      .isAlpha()
      .withMessage('Vehicle make must contain only letters.')
      .isLength({ min: 2, max: 20 })
      .withMessage('Vehicle make must be 2-20 characters.'),
      
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1-1000.'),
      
    query('limit')
      .optional()
      .isInt({ min: 5, max: 100 })
      .withMessage('Limit must be between 5-100.')
  ];
}

/**
 * Bulk action validation
 */
function bulkActionRules() {
  return [
    body('action')
      .notEmpty()
      .withMessage('Action is required.')
      .isIn(['approve', 'reject', 'delete'])
      .withMessage('Invalid bulk action.'),
      
    body('review_ids')
      .isArray({ min: 1, max: 100 })
      .withMessage('Must select 1-100 reviews.')
      .custom(value => {
        // Validate each ID
        const invalidIds = value.filter(id => 
          !Number.isInteger(parseInt(id)) || parseInt(id) < 1
        );
        
        if (invalidIds.length > 0) {
          throw new Error('Invalid review IDs detected.');
        }
        
        // Check for duplicates
        const uniqueIds = [...new Set(value)];
        if (uniqueIds.length !== value.length) {
          throw new Error('Duplicate review IDs detected.');
        }
        
        return true;
      })
  ];
}

/**
 * Enhanced error handling for validation
 */
async function checkAdvancedValidation(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    
    // Log validation failures for security monitoring
    console.log('Validation failed:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      errors: errors.array()
    });
    
    // For API requests, return JSON
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // For form submissions, render with errors
    req.flash('errors', errors.array());
    
    // Redirect based on the type of validation failure
    if (req.path.includes('add')) {
      return res.redirect(`/reviews/add/${req.body.inv_id || ''}`);
    } else if (req.path.includes('edit')) {
      return res.redirect(`/reviews/edit/${req.params.review_id || ''}`);
    } else {
      return res.redirect('/reviews/my-reviews');
    }
  }
  
  next();
}

/**
 * Security headers middleware for review endpoints
 */
function reviewSecurityHeaders() {
  return (req, res, next) => {
    // Prevent XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy for review forms
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
    
    next();
  };
}

module.exports = {
  advancedReviewRules,
  reviewRateLimitValidation,
  advancedFilterRules,
  bulkActionRules,
  checkAdvancedValidation,
  reviewSecurityHeaders
};