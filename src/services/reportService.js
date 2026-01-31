/**
 * Report Service
 * Business logic for analytics and reporting
 */

const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { parseDateRange } = require("../utils/helpers");
const { CATEGORIES } = require("../config/constants");

/**
 * Get summary report (income, expenses, net balance)
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
const getSummaryReport = async (userId, queryParams) => {
  const { startDate, endDate, division } = queryParams;

  const match = { userId: new mongoose.Types.ObjectId(userId) };
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) match.date = dateFilter;
  if (division) match.division = division;

  const summary = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        transactionCount: { $sum: 1 },
        avgTransactionAmount: { $avg: "$amount" },
      },
    },
  ]);

  const result = summary[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0,
    avgTransactionAmount: 0,
  };

  result.netBalance = result.totalIncome - result.totalExpenses;
  result.savingsRate =
    result.totalIncome > 0
      ? ((result.netBalance / result.totalIncome) * 100).toFixed(2)
      : 0;

  return result;
};

/**
 * Get breakdown by category
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>}
 */
const getCategoryBreakdown = async (userId, queryParams) => {
  const { startDate, endDate, type = "expense", division } = queryParams;

  const match = { userId: new mongoose.Types.ObjectId(userId), type };
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) match.date = dateFilter;
  if (division) match.division = division;

  const breakdown = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Calculate percentages
  const grandTotal = breakdown.reduce((sum, cat) => sum + cat.total, 0);

  return breakdown.map((cat) => ({
    _id: cat._id,
    total: cat.total,
    count: cat.count,
    avgAmount: cat.avgAmount,
    percentage:
      grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(2) : 0,
  }));
};

/**
 * Get breakdown by division (office vs personal)
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
const getDivisionBreakdown = async (userId, queryParams) => {
  const { startDate, endDate, type } = queryParams;

  const match = { userId: new mongoose.Types.ObjectId(userId) };
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) match.date = dateFilter;
  if (type) match.type = type;

  const breakdown = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { division: "$division", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Organize results
  const result = {
    office: { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 },
    personal: { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 },
  };

  breakdown.forEach((item) => {
    const { division, type } = item._id;
    if (result[division]) {
      result[division][type] = item.total;
      result[division][`${type}Count`] = item.count;
    }
  });

  // Calculate net for each division
  result.office.net = result.office.income - result.office.expense;
  result.personal.net = result.personal.income - result.personal.expense;

  // Convert to array format for charts
  return [
    {
      _id: "Office",
      income: result.office.income,
      expense: result.office.expense,
      net: result.office.net,
    },
    {
      _id: "Personal",
      income: result.personal.income,
      expense: result.personal.expense,
      net: result.personal.net,
    },
  ];
};

/**
 * Get trend data for charts (time series)
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>}
 */
const getTrends = async (userId, queryParams) => {
  const { startDate, endDate, groupBy = "day", division } = queryParams;

  const match = { userId: new mongoose.Types.ObjectId(userId) };
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) match.date = dateFilter;
  if (division) match.division = division;

  // Determine date grouping format
  let dateFormat;
  switch (groupBy) {
    case "month":
      dateFormat = { year: { $year: "$date" }, month: { $month: "$date" } };
      break;
    case "week":
      dateFormat = { year: { $year: "$date" }, week: { $week: "$date" } };
      break;
    case "day":
    default:
      dateFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
  }

  const trends = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: dateFormat,
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
  ]);

  // Format dates for response
  return trends.map((item) => ({
    date: formatTrendDate(item._id, groupBy),
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
    count: item.count,
  }));
};

/**
 * Format trend date based on grouping
 */
const formatTrendDate = (dateObj, groupBy) => {
  const { year, month, day, week } = dateObj;
  switch (groupBy) {
    case "month":
      return `${year}-${String(month).padStart(2, "0")}`;
    case "week":
      return `${year}-W${String(week).padStart(2, "0")}`;
    default:
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
};

module.exports = {
  getSummaryReport,
  getCategoryBreakdown,
  getDivisionBreakdown,
  getTrends,
};
