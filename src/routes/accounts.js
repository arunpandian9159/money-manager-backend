/**
 * Account Routes
 * Routes for account management
 */

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
const { accountValidation } = require('../middleware/validate');
const { createAccountLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/accounts/summary
 * @desc    Get account summary (total balance across all accounts)
 * @access  Private
 * @note    This route must be defined before /:id to avoid conflicts
 */
router.get('/summary', accountController.getSummary);

/**
 * @route   POST /api/accounts/transfer
 * @desc    Transfer between accounts
 * @access  Private
 */
router.post('/transfer', accountController.transfer);

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts for user
 * @access  Private
 * @query   type, isActive
 */
router.get('/', accountController.getAccounts);

/**
 * @route   POST /api/accounts
 * @desc    Create a new account
 * @access  Private
 */
router.post('/', createAccountLimiter, accountValidation.create, accountController.createAccount);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get single account by ID
 * @access  Private
 */
router.get('/:id', accountValidation.getById, accountController.getAccount);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account
 * @access  Private
 */
router.put('/:id', accountValidation.update, accountController.updateAccount);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete account (soft delete)
 * @access  Private
 */
router.delete('/:id', accountValidation.getById, accountController.deleteAccount);

module.exports = router;

