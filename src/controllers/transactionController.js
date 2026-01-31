/**
 * Transaction Controller
 * Handles transaction HTTP requests
 */

const asyncHandler = require("../utils/asyncHandler");
const transactionService = require("../services/transactionService");

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(
    req.user._id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: {
      transaction,
    },
  });
});

/**
 * @desc    Get all transactions for user
 * @route   GET /api/transactions
 * @access  Private
 * @query   type, division, category, startDate, endDate, search, page, limit, sortBy, sortOrder
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { transactions, pagination } = await transactionService.getTransactions(
    req.user._id,
    req.query,
  );

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination,
    },
  });
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    data: {
      transaction,
    },
  });
});

/**
 * @desc    Update transaction (12-hour edit window enforced)
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    req.user._id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Transaction updated successfully",
    data: {
      transaction,
    },
  });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
  });
});

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/transactions/summary
 * @access  Private
 * @query   startDate, endDate
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await transactionService.getSummary(
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

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
