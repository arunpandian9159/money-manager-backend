/**
 * Database Seed Script
 * Populates the database with mock data for development/testing
 * 
 * Usage: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { CATEGORIES, DIVISIONS, TRANSACTION_TYPES, ACCOUNT_TYPES } = require('../config/constants');

// Mock Users Data
const mockUsers = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123'
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'password123'
  },
  {
    email: 'demo@moneymanager.com',
    firstName: 'Demo',
    lastName: 'User',
    password: 'demo1234'
  }
];

// Mock Accounts Data (will be linked to users after creation)
const mockAccountsTemplate = [
  { name: 'Main Checking', type: 'checking', balance: 5420.50, lastFour: '4521', color: '#1d69ed' },
  { name: 'Emergency Savings', type: 'savings', balance: 15000.00, lastFour: '8832', color: '#10b981' },
  { name: 'Travel Credit Card', type: 'credit', balance: -1250.75, lastFour: '9012', color: '#f59e0b' },
  { name: 'Business Checking', type: 'checking', balance: 8750.00, lastFour: '6677', color: '#6366f1' },
  { name: 'High-Yield Savings', type: 'savings', balance: 25000.00, lastFour: '1234', color: '#14b8a6' }
];

// Transaction descriptions by category
const transactionDescriptions = {
  fuel: ['Gas station fill-up', 'Shell gas', 'BP fuel', 'Chevron gas', 'Costco gas'],
  food: ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Fast food lunch', 'Food delivery'],
  entertainment: ['Netflix subscription', 'Movie tickets', 'Concert tickets', 'Spotify premium', 'Gaming subscription'],
  medical: ['Doctor visit', 'Pharmacy', 'Dental checkup', 'Eye exam', 'Health supplements'],
  transportation: ['Uber ride', 'Bus pass', 'Train ticket', 'Parking fee', 'Car maintenance'],
  loan_emi: ['Home loan EMI', 'Car loan payment', 'Personal loan EMI', 'Education loan', 'Credit card payment'],
  shopping: ['Amazon purchase', 'Clothing store', 'Electronics', 'Home decor', 'Online shopping'],
  utilities: ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill', 'Gas bill'],
  education: ['Online course', 'Book purchase', 'Certification exam', 'Workshop fee', 'Tuition fee'],
  others: ['Miscellaneous', 'Gift purchase', 'Donation', 'Subscription', 'Service fee']
};

// Income descriptions
const incomeDescriptions = [
  'Monthly salary', 'Freelance payment', 'Bonus', 'Investment dividend', 'Rental income',
  'Side project income', 'Consulting fee', 'Commission', 'Refund received', 'Interest earned'
];

// Helper to get random element from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random amount
const randomAmount = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);

// Helper to get random date within last 90 days
const randomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  return new Date(now.setDate(now.getDate() - daysAgo));
};

// Generate transactions for a user
const generateTransactions = (userId, accounts) => {
  const transactions = [];
  const numTransactions = 50 + Math.floor(Math.random() * 30); // 50-80 transactions

  for (let i = 0; i < numTransactions; i++) {
    const isIncome = Math.random() < 0.25; // 25% chance of income
    const category = randomItem(CATEGORIES);
    const division = randomItem(DIVISIONS);
    const account = accounts.length > 0 ? randomItem(accounts) : null;

    transactions.push({
      userId,
      type: isIncome ? 'income' : 'expense',
      amount: isIncome ? randomAmount(500, 10000) : randomAmount(10, 500),
      category,
      division,
      description: isIncome 
        ? randomItem(incomeDescriptions) 
        : randomItem(transactionDescriptions[category]),
      date: randomDate(),
      accountId: account ? account._id : null
    });
  }

  return transactions;
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('✅ Cleared all collections');

    // Create users
    console.log('\n👥 Creating users...');
    const createdUsers = await User.create(mockUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create accounts for each user
    console.log('\n🏦 Creating accounts...');
    let allAccounts = [];
    for (const user of createdUsers) {
      const userAccounts = mockAccountsTemplate.slice(0, 3 + Math.floor(Math.random() * 3)).map(acc => ({
        ...acc,
        userId: user._id
      }));
      const created = await Account.create(userAccounts);
      allAccounts.push(...created);
    }
    console.log(`✅ Created ${allAccounts.length} accounts`);

    // Create transactions for each user
    console.log('\n💰 Creating transactions...');
    let totalTransactions = 0;
    for (const user of createdUsers) {
      const userAccounts = allAccounts.filter(acc => acc.userId.toString() === user._id.toString());
      const transactions = generateTransactions(user._id, userAccounts);
      await Transaction.insertMany(transactions);
      totalTransactions += transactions.length;
    }
    console.log(`✅ Created ${totalTransactions} transactions`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(50));
    console.log(`Users:        ${createdUsers.length}`);
    console.log(`Accounts:     ${allAccounts.length}`);
    console.log(`Transactions: ${totalTransactions}`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    mockUsers.forEach(user => {
      console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed
seedDatabase();

