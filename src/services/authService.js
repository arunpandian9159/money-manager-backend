/**
 * Auth Service
 * Business logic for authentication operations
 */

const User = require("../models/User");
const AccountService = require("./accountService");
const ApiError = require("../utils/ApiError");
const { sanitizeUser } = require("../utils/helpers");

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<{user: Object, token: string}>}
 */
const registerUser = async (userData) => {
  const { email, firstName, lastName, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("User with this email already exists");
  }

  // Create user
  const user = await User.create({
    email,
    firstName,
    lastName,
    password,
  });

  // Create initial account if cardData is provided
  if (userData.cardData && userData.cardData.number) {
    const { number, month, year, holder } = userData.cardData;
    await AccountService.createAccount(user._id, {
      name: holder || `${firstName}'s Primary Card`,
      type: "credit",
      balance: 0,
      lastFour: number.slice(-4),
      expiryMonth: month,
      expiryYear: year,
    });
  }

  // Generate token
  const token = user.generateAuthToken();

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>}
 */
const loginUser = async (email, password) => {
  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.unauthorized("Account is deactivated");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Generate token
  const token = user.generateAuthToken();

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return sanitizeUser(user);
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
const updateUserProfile = async (userId, updateData) => {
  const { firstName, lastName, email } = updateData;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw ApiError.conflict("Email is already in use");
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, email },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return sanitizeUser(user);
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
};
