// models/review-analytics-model.js
// Advanced analytics and reporting for the review system
const db = require('../database');

/**
 * Get comprehensive review analytics for dashboard
 * @returns {Object} Complete analytics data
 */
async function getReviewAnalytics() {
  const sql = `
    WITH review_stats AS (
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN review_approved = TRUE THEN 1 END) as approved_reviews,
        COUNT(CASE WHEN review_approved = FALSE THEN 1 END) as pending_reviews,
        ROUND(AVG(review_rating), 2) as overall_avg_rating,
        COUNT(DISTINCT account_id) as unique_reviewers,
        COUNT(DISTINCT inv_id) as vehicles_with_reviews
      FROM public.review
    ),
    rating_distribution AS (
      SELECT 
        review_rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentage
      FROM public.review 
      WHERE review_approved = TRUE
      GROUP BY review_rating
      ORDER BY review_rating DESC
    ),
    monthly_trends AS (
      SELECT 
        DATE_TRUNC('month', review_date) as month,
        COUNT(*) as review_count,
        ROUND(AVG(review_rating), 2) as avg_rating
      FROM public.review 
      WHERE review_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', review_date)
      ORDER BY month DESC
      LIMIT 12
    ),
    top_vehicles AS (
      SELECT 
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_id,
        COUNT(r.review_id) as review_count,
        ROUND(AVG(r.review_rating), 1) as avg_rating
      FROM public.inventory i
      JOIN public.review r ON i.inv_id = r.inv_id
      WHERE r.review_approved = TRUE
      GROUP BY i.inv_id, i.inv_make, i.inv_model, i.inv_year
      ORDER BY review_count DESC, avg_rating DESC
      LIMIT 10
    )
    SELECT 
      (SELECT row_to_json(review_stats) FROM review_stats) as stats,
      (SELECT json_agg(rating_distribution ORDER BY review_rating DESC) FROM rating_distribution) as rating_dist,
      (SELECT json_agg(monthly_trends ORDER BY month DESC) FROM monthly_trends) as trends,
      (SELECT json_agg(top_vehicles) FROM top_vehicles) as top_vehicles
  `;
  
  const result = await db.query(sql);
  return result.rows[0] || {
    stats: { total_reviews: 0, approved_reviews: 0, pending_reviews: 0 },
    rating_dist: [],
    trends: [],
    top_vehicles: []
  };
}

/**
 * Get reviews with advanced filtering and sorting
 * @param {Object} filters - Filter criteria
 * @param {Object} sorting - Sort options
 * @param {Object} pagination - Pagination options
 * @returns {Object} Filtered and paginated reviews
 */
async function getAdvancedReviews(filters = {}, sorting = {}, pagination = {}) {
  const {
    rating_min = 1,
    rating_max = 5,
    date_from,
    date_to,
    approved_status,
    make,
    model,
    search_term
  } = filters;
  
  const {
    sort_by = 'review_date',
    sort_order = 'DESC'
  } = sorting;
  
  const {
    page = 1,
    limit = 20
  } = pagination;
  
  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let params = [];
  let paramIndex = 1;
  
  // Build WHERE conditions dynamically
  whereConditions.push(`r.review_rating BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
  params.push(rating_min, rating_max);
  paramIndex += 2;
  
  if (date_from) {
    whereConditions.push(`r.review_date >= $${paramIndex}`);
    params.push(date_from);
    paramIndex++;
  }
  
  if (date_to) {
    whereConditions.push(`r.review_date <= $${paramIndex}`);
    params.push(date_to);
    paramIndex++;
  }
  
  if (approved_status !== undefined) {
    whereConditions.push(`r.review_approved = $${paramIndex}`);
    params.push(approved_status);
    paramIndex++;
  }
  
  if (make) {
    whereConditions.push(`LOWER(i.inv_make) = LOWER($${paramIndex})`);
    params.push(make);
    paramIndex++;
  }
  
  if (model) {
    whereConditions.push(`LOWER(i.inv_model) = LOWER($${paramIndex})`);
    params.push(model);
    paramIndex++;
  }
  
  if (search_term) {
    whereConditions.push(`(
      LOWER(r.review_title) LIKE LOWER($${paramIndex}) OR 
      LOWER(r.review_text) LIKE LOWER($${paramIndex}) OR
      LOWER(a.account_firstname) LIKE LOWER($${paramIndex}) OR
      LOWER(a.account_lastname) LIKE LOWER($${paramIndex})
    )`);
    params.push(`%${search_term}%`);
    paramIndex++;
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Validate sort column to prevent SQL injection
  const validSortColumns = ['review_date', 'review_rating', 'review_title', 'inv_make', 'inv_model'];
  const safeSortBy = validSortColumns.includes(sort_by) ? sort_by : 'review_date';
  const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const countSql = `
    SELECT COUNT(*) as total
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    JOIN public.inventory i ON r.inv_id = i.inv_id
    ${whereClause}
  `;
  
  const dataSql = `
    SELECT 
      r.*,
      a.account_firstname,
      a.account_lastname,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_color
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    JOIN public.inventory i ON r.inv_id = i.inv_id
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  params.push(limit, offset);
  
  const [countResult, dataResult] = await Promise.all([
    db.query(countSql, params.slice(0, -2)),
    db.query(dataSql, params)
  ]);
  
  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);
  
  return {
    reviews: dataResult.rows,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_records: total,
      limit: limit,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
}

/**
 * Bulk approve or reject reviews
 * @param {Array} review_ids - Array of review IDs
 * @param {boolean} approved - Approval status
 * @returns {Object} Operation result
 */
async function bulkUpdateReviewStatus(review_ids, approved) {
  if (!Array.isArray(review_ids) || review_ids.length === 0) {
    throw new Error('Review IDs array is required and cannot be empty');
  }
  
  const placeholders = review_ids.map((_, index) => `$${index + 2}`).join(',');
  const sql = `
    UPDATE public.review 
    SET review_approved = $1, review_date = COALESCE(review_date, NOW())
    WHERE review_id IN (${placeholders})
    RETURNING review_id, review_approved
  `;
  
  const params = [approved, ...review_ids];
  const result = await db.query(sql, params);
  
  return {
    updated_count: result.rowCount,
    updated_reviews: result.rows
  };
}

/**
 * Get review sentiment analysis (basic keyword-based)
 * @param {number} inv_id - Optional vehicle ID filter
 * @returns {Object} Sentiment analysis results
 */
async function getReviewSentimentAnalysis(inv_id = null) {
  const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'perfect', 'outstanding', 'superb', 'brilliant', 'awesome'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing', 'poor', 'useless', 'broken', 'failed'];
  
  let whereClause = 'WHERE r.review_approved = TRUE';
  let params = [];
  
  if (inv_id) {
    whereClause += ' AND r.inv_id = $1';
    params.push(inv_id);
  }
  
  const sql = `
    SELECT 
      r.review_id,
      r.review_title,
      r.review_text,
      r.review_rating,
      i.inv_make,
      i.inv_model,
      LENGTH(r.review_text) as text_length,
      (
        SELECT COUNT(*)
        FROM unnest(string_to_array(LOWER(r.review_text), ' ')) as word
        WHERE word = ANY($${params.length + 1})
      ) as positive_word_count,
      (
        SELECT COUNT(*)
        FROM unnest(string_to_array(LOWER(r.review_text), ' ')) as word
        WHERE word = ANY($${params.length + 2})
      ) as negative_word_count
    FROM public.review r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    ${whereClause}
    ORDER BY r.review_date DESC
  `;
  
  params.push(positiveWords, negativeWords);
  const result = await db.query(sql, params);
  
  const reviews = result.rows.map(row => {
    const sentiment_score = (row.positive_word_count - row.negative_word_count) / Math.max(row.text_length / 100, 1);
    let sentiment = 'neutral';
    
    if (sentiment_score > 0.5) sentiment = 'positive';
    else if (sentiment_score < -0.5) sentiment = 'negative';
    
    return {
      ...row,
      sentiment_score,
      sentiment
    };
  });
  
  const summary = {
    total_reviews: reviews.length,
    positive_sentiment: reviews.filter(r => r.sentiment === 'positive').length,
    negative_sentiment: reviews.filter(r => r.sentiment === 'negative').length,
    neutral_sentiment: reviews.filter(r => r.sentiment === 'neutral').length
  };
  
  return { reviews, summary };
}

/**
 * Get comparative vehicle ratings
 * @param {string} make - Vehicle make to compare
 * @returns {Array} Comparative analysis
 */
async function getComparativeVehicleRatings(make) {
  const sql = `
    WITH vehicle_stats AS (
      SELECT 
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        COUNT(r.review_id) as review_count,
        ROUND(AVG(r.review_rating), 2) as avg_rating,
        MIN(r.review_rating) as min_rating,
        MAX(r.review_rating) as max_rating,
        MODE() WITHIN GROUP (ORDER BY r.review_rating) as mode_rating
      FROM public.inventory i
      LEFT JOIN public.review r ON i.inv_id = r.inv_id AND r.review_approved = TRUE
      WHERE LOWER(i.inv_make) = LOWER($1)
      GROUP BY i.inv_id, i.inv_make, i.inv_model, i.inv_year
      HAVING COUNT(r.review_id) > 0
    ),
    make_average AS (
      SELECT ROUND(AVG(avg_rating), 2) as make_avg_rating
      FROM vehicle_stats
    )
    SELECT 
      vs.*,
      ma.make_avg_rating,
      CASE 
        WHEN vs.avg_rating > ma.make_avg_rating THEN 'above_average'
        WHEN vs.avg_rating < ma.make_avg_rating THEN 'below_average'
        ELSE 'average'
      END as performance_vs_make
    FROM vehicle_stats vs
    CROSS JOIN make_average ma
    ORDER BY vs.avg_rating DESC, vs.review_count DESC
  `;
  
  const result = await db.query(sql, [make]);
  return result.rows;
}

module.exports = {
  getReviewAnalytics,
  getAdvancedReviews,
  bulkUpdateReviewStatus,
  getReviewSentimentAnalysis,
  getComparativeVehicleRatings
};