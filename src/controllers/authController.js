/**
 * Auth Controller
 * Handles authentication HTTP requests
 */

const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  const { user, token } = await authService.registerUser({
    email,
    firstName,
    lastName,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint exists for API consistency and potential future token blacklisting
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;

  const user = await authService.updateUserProfile(req.user._id, {
    firstName,
    lastName,
    email,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
};
