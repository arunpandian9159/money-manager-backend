/**
 * Account Service
 * Business logic for account management
 */

const Account = require("../models/Account");
const ApiError = require("../utils/ApiError");

/**
 * Create a new account
 * @param {string} userId - User ID
 * @param {Object} accountData - Account data
 * @returns {Promise<Object>}
 */
const createAccount = async (userId, accountData) => {
  const account = await Account.create({
    userId,
    ...accountData,
  });

  return account;
};

/**
 * Get all accounts for a user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>}
 */
const getAccounts = async (userId, queryParams = {}) => {
  const { type, isActive = true } = queryParams;

  const filter = { userId };
  if (type) filter.type = type;
  if (isActive !== undefined)
    filter.isActive = isActive === "true" || isActive === true;

  const accounts = await Account.find(filter).sort({ createdAt: -1 });

  return accounts;
};

/**
 * Get a single account by ID
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>}
 */
const getAccountById = async (userId, accountId) => {
  const account = await Account.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  return account;
};

/**
 * Update an account
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
const updateAccount = async (userId, accountId, updateData) => {
  const account = await Account.findOneAndUpdate(
    { _id: accountId, userId },
    updateData,
    { new: true, runValidators: true },
  );

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  return account;
};

/**
 * Delete an account (soft delete by setting isActive to false)
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<void>}
 */
const deleteAccount = async (userId, accountId) => {
  const account = await Account.findOneAndUpdate(
    { _id: accountId, userId },
    { isActive: false },
    { new: true },
  );

  if (!account) {
    throw ApiError.notFound("Account not found");
  }
};

/**
 * Transfer between accounts
 * @param {string} userId - User ID
 * @param {string} fromAccountId - Source account ID
 * @param {string} toAccountId - Destination account ID
 * @param {number} amount - Amount to transfer
 * @returns {Promise<Object>}
 */
const transferBetweenAccounts = async (
  userId,
  fromAccountId,
  toAccountId,
  amount,
) => {
  if (amount <= 0) {
    throw ApiError.badRequest("Transfer amount must be positive");
  }

  if (fromAccountId === toAccountId) {
    throw ApiError.badRequest("Cannot transfer to the same account");
  }

  // Get both accounts
  const [fromAccount, toAccount] = await Promise.all([
    Account.findOne({ _id: fromAccountId, userId, isActive: true }),
    Account.findOne({ _id: toAccountId, userId, isActive: true }),
  ]);

  if (!fromAccount) {
    throw ApiError.notFound("Source account not found");
  }

  if (!toAccount) {
    throw ApiError.notFound("Destination account not found");
  }

  if (fromAccount.balance < amount) {
    throw ApiError.badRequest("Insufficient balance in source account");
  }

  // Perform transfer
  fromAccount.balance -= amount;
  toAccount.balance += amount;

  await Promise.all([fromAccount.save(), toAccount.save()]);

  return {
    fromAccount,
    toAccount,
    amount,
  };
};

/**
 * Get account summary (total balance across all accounts)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
const getAccountSummary = async (userId) => {
  const accounts = await Account.find({ userId, isActive: true });

  const summary = {
    totalBalance: 0,
    accountCount: accounts.length,
    byType: {
      checking: { count: 0, balance: 0 },
      savings: { count: 0, balance: 0 },
      credit: { count: 0, balance: 0 },
    },
  };

  accounts.forEach((account) => {
    summary.totalBalance += account.balance;
    if (summary.byType[account.type]) {
      summary.byType[account.type].count++;
      summary.byType[account.type].balance += account.balance;
    }
  });

  return summary;
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  transferBetweenAccounts,
  getAccountSummary,
};
