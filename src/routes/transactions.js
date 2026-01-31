/**
 * Transaction Routes
 * Routes for transaction CRUD operations
 */

const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const { transactionValidation } = require("../middleware/validate");

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get dashboard summary statistics
 * @access  Private
 * @note    This route must be defined before /:id to avoid conflicts
 */
router.get("/summary", transactionController.getSummary);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for user (with filters and pagination)
 * @access  Private
 * @query   type, division, category, startDate, endDate, search, page, limit, sortBy, sortOrder
 */
router.get("/", transactionController.getTransactions);

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post(
  "/",
  transactionValidation.create,
  transactionController.createTransaction,
);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private
 */
router.get(
  "/:id",
  transactionValidation.getById,
  transactionController.getTransaction,
);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction (12-hour edit window enforced)
 * @access  Private
 */
router.put(
  "/:id",
  transactionValidation.update,
  transactionController.updateTransaction,
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
router.delete(
  "/:id",
  transactionValidation.getById,
  transactionController.deleteTransaction,
);

module.exports = router;
