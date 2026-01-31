/**
 * Report Routes
 * Routes for analytics and reporting
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/reports/summary
 * @desc    Get summary report (income, expenses, net balance)
 * @access  Private
 * @query   startDate, endDate, division
 */
router.get('/summary', reportController.getSummary);

/**
 * @route   GET /api/reports/by-category
 * @desc    Get breakdown by category
 * @access  Private
 * @query   startDate, endDate, type (income/expense), division
 */
router.get('/by-category', reportController.getByCategory);

/**
 * @route   GET /api/reports/by-division
 * @desc    Get breakdown by division (office vs personal)
 * @access  Private
 * @query   startDate, endDate, type
 */
router.get('/by-division', reportController.getByDivision);

/**
 * @route   GET /api/reports/trends
 * @desc    Get trend data for charts (time series)
 * @access  Private
 * @query   startDate, endDate, groupBy (day/week/month), division
 */
router.get('/trends', reportController.getTrends);

module.exports = router;

