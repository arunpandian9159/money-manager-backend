/**
 * Controllers Index
 * Export all controllers from a single entry point
 */

const authController = require('./authController');
const transactionController = require('./transactionController');
const reportController = require('./reportController');
const accountController = require('./accountController');

module.exports = {
  authController,
  transactionController,
  reportController,
  accountController
};

