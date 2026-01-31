/**
 * Transaction Service
 * Business logic for transaction operations
 */

const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');
const { isWithinEditWindow, buildPagination, parseDateRange } = require('../utils/helpers');
const { PAGINATION, EDIT_WINDOW_HOURS } = require('../config/constants');

/**
 * Create a new transaction
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>}
 */
const createTransaction = async (userId, transactionData) => {
  const transaction = await Transaction.create({
    userId,
    ...transactionData
  });

  return transaction;
};

/**
 * Get all transactions for a user with filters and pagination
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters for filtering
 * @returns {Promise<{transactions: Array, pagination: Object}>}
 */
const getTransactions = async (userId, queryParams) => {
  const {
    type,
    division,
    category,
    startDate,
    endDate,
    search,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'date',
    sortOrder = 'desc'
  } = queryParams;

  // Build filter query
  const filter = { userId };

  if (type) filter.type = type;
  if (division) filter.division = division;
  if (category) filter.category = category;

  // Date range filter
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) filter.date = dateFilter;

  // Search in description
  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  // Calculate pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(Math.max(1, parseInt(limit)), PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('accountId', 'name type'),
    Transaction.countDocuments(filter)
  ]);

  return {
    transactions,
    pagination: buildPagination(pageNum, limitNum, total)
  };
};

/**
 * Get a single transaction by ID
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>}
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId
  }).populate('accountId', 'name type');

  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }

  return transaction;
};

/**
 * Update a transaction (with 12-hour edit window check)
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId
  });

  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }

  // Check 12-hour edit window
  if (!isWithinEditWindow(transaction.createdAt)) {
    throw ApiError.forbidden(
      `Transactions can only be edited within ${EDIT_WINDOW_HOURS} hours of creation`
    );
  }

  // Update allowed fields
  const allowedUpdates = ['type', 'amount', 'category', 'division', 'description', 'date', 'accountId'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      transaction[field] = updateData[field];
    }
  });

  await transaction.save();

  return transaction;
};

/**
 * Delete a transaction
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<void>}
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId
  });

  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }
};

/**
 * Get dashboard summary statistics
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters (startDate, endDate)
 * @returns {Promise<Object>}
 */
const getSummary = async (userId, queryParams) => {
  const { startDate, endDate } = queryParams;

  // Build match stage
  const match = { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) };
  const dateFilter = parseDateRange(startDate, endDate);
  if (dateFilter) match.date = dateFilter;

  const summary = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
        },
        transactionCount: { $sum: 1 }
      }
    }
  ]);

  const result = summary[0] || { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
  result.netBalance = result.totalIncome - result.totalExpenses;

  return result;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary
};

