/**
 * Transaction Model
 * Mongoose schema for income and expense transactions
 */

const mongoose = require('mongoose');
const { TRANSACTION_TYPES, DIVISIONS, CATEGORIES, EDIT_WINDOW_HOURS } = require('../config/constants');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: TRANSACTION_TYPES,
      message: 'Type must be either income or expense'
    },
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  category: {
    type: String,
    enum: {
      values: CATEGORIES,
      message: `Category must be one of: ${CATEGORIES.join(', ')}`
    },
    required: [true, 'Category is required']
  },
  division: {
    type: String,
    enum: {
      values: DIVISIONS,
      message: 'Division must be either office or personal'
    },
    required: [true, 'Division is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, division: 1 });

/**
 * Virtual: Check if transaction is within edit window
 */
transactionSchema.virtual('isEditable').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  return hoursDiff < EDIT_WINDOW_HOURS;
});

/**
 * Virtual: Get remaining edit time
 */
transactionSchema.virtual('editTimeRemaining').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  
  if (hoursDiff >= EDIT_WINDOW_HOURS) {
    return null;
  }
  
  const remainingHours = EDIT_WINDOW_HOURS - hoursDiff;
  return {
    hours: Math.floor(remainingHours),
    minutes: Math.floor((remainingHours - Math.floor(remainingHours)) * 60)
  };
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

/**
 * Transform transaction document for JSON response
 */
transactionSchema.methods.toJSON = function() {
  const transaction = this.toObject({ virtuals: true });
  delete transaction.__v;
  return transaction;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

