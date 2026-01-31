/**
 * Account Controller
 * Handles account management HTTP requests
 */

const asyncHandler = require('../utils/asyncHandler');
const accountService = require('../services/accountService');

/**
 * @desc    Create a new account
 * @route   POST /api/accounts
 * @access  Private
 */
const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.createAccount(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      account
    }
  });
});

/**
 * @desc    Get all accounts for user
 * @route   GET /api/accounts
 * @access  Private
 * @query   type, isActive
 */
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.getAccounts(req.user._id, req.query);

  res.status(200).json({
    success: true,
    data: {
      accounts,
      count: accounts.length
    }
  });
});

/**
 * @desc    Get single account
 * @route   GET /api/accounts/:id
 * @access  Private
 */
const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountById(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: {
      account
    }
  });
});

/**
 * @desc    Update account
 * @route   PUT /api/accounts/:id
 * @access  Private
 */
const updateAccount = asyncHandler(async (req, res) => {
  const account = await accountService.updateAccount(
    req.user._id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Account updated successfully',
    data: {
      account
    }
  });
});

/**
 * @desc    Delete account (soft delete)
 * @route   DELETE /api/accounts/:id
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await accountService.deleteAccount(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * @desc    Transfer between accounts
 * @route   POST /api/accounts/transfer
 * @access  Private
 */
const transfer = asyncHandler(async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  const result = await accountService.transferBetweenAccounts(
    req.user._id,
    fromAccountId,
    toAccountId,
    parseFloat(amount)
  );

  res.status(200).json({
    success: true,
    message: 'Transfer completed successfully',
    data: result
  });
});

/**
 * @desc    Get account summary
 * @route   GET /api/accounts/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await accountService.getAccountSummary(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      summary
    }
  });
});

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  transfer,
  getSummary
};

