/**
 * Models Index
 * Export all Mongoose models from a single entry point
 */

const User = require("./User");
const Transaction = require("./Transaction");
const Account = require("./Account");

module.exports = {
  User,
  Transaction,
  Account,
};
