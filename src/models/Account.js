/**
 * Account Model
 * Mongoose schema for user financial accounts
 */

const mongoose = require('mongoose');
const { ACCOUNT_TYPES } = require('../config/constants');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [50, 'Account name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: {
      values: ACCOUNT_TYPES,
      message: `Account type must be one of: ${ACCOUNT_TYPES.join(', ')}`
    },
    required: [true, 'Account type is required']
  },
  balance: {
    type: Number,
    default: 0
  },
  lastFour: {
    type: String,
    maxlength: [4, 'Last four digits cannot exceed 4 characters'],
    match: [/^\d{0,4}$/, 'Last four must be numeric'],
    default: null
  },
  color: {
    type: String,
    default: '#1d69ed' // Primary blue
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user accounts
accountSchema.index({ userId: 1, isActive: 1 });

/**
 * Get masked account number
 * @returns {string} Masked account number (e.g., "****1234")
 */
accountSchema.methods.getMaskedNumber = function() {
  if (!this.lastFour) return null;
  return `****${this.lastFour}`;
};

/**
 * Update account balance
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @returns {Promise<Account>} Updated account
 */
accountSchema.methods.updateBalance = async function(amount) {
  this.balance += amount;
  return await this.save();
};

/**
 * Transform account document for JSON response
 */
accountSchema.methods.toJSON = function() {
  const account = this.toObject();
  delete account.__v;
  // Add masked number to response
  account.maskedNumber = this.getMaskedNumber();
  return account;
};

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;

