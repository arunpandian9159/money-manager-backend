/**
 * Auth Routes
 * Routes for user authentication
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authValidation } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  authValidation.register,
  authController.register,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", authLimiter, authValidation.login, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", protect, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", protect, authController.logout);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", protect, authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put("/password", protect, authController.changePassword);

module.exports = router;
