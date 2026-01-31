/**
 * Report Controller
 * Handles analytics and reporting HTTP requests
 */

const asyncHandler = require("../utils/asyncHandler");
const reportService = require("../services/reportService");

/**
 * @desc    Get summary report
 * @route   GET /api/reports/summary
 * @access  Private
 * @query   startDate, endDate, division
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await reportService.getSummaryReport(
    req.user._id.toString(),
    req.query,
  );

  res.status(200).json({
    success: true,
    data: {
      summary,
    },
  });
});

/**
 * @desc    Get breakdown by category
 * @route   GET /api/reports/by-category
 * @access  Private
 * @query   startDate, endDate, type (income/expense), division
 */
const getByCategory = asyncHandler(async (req, res) => {
  const breakdown = await reportService.getCategoryBreakdown(
    req.user._id.toString(),
    req.query,
  );

  res.status(200).json({
    success: true,
    data: {
      breakdown,
    },
  });
});

/**
 * @desc    Get breakdown by division (office vs personal)
 * @route   GET /api/reports/by-division
 * @access  Private
 * @query   startDate, endDate, type
 */
const getByDivision = asyncHandler(async (req, res) => {
  const breakdown = await reportService.getDivisionBreakdown(
    req.user._id.toString(),
    req.query,
  );

  res.status(200).json({
    success: true,
    data: {
      breakdown,
    },
  });
});

/**
 * @desc    Get trend data for charts
 * @route   GET /api/reports/trends
 * @access  Private
 * @query   startDate, endDate, groupBy (day/week/month), division
 */
const getTrends = asyncHandler(async (req, res) => {
  const trends = await reportService.getTrends(
    req.user._id.toString(),
    req.query,
  );

  res.status(200).json({
    success: true,
    data: {
      trends,
    },
  });
});

module.exports = {
  getSummary,
  getByCategory,
  getByDivision,
  getTrends,
};
