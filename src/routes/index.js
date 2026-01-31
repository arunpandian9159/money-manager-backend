/**
 * Routes Index
 * Central router that combines all route modules
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const transactionRoutes = require("./transactions");
const reportRoutes = require("./reports");
const accountRoutes = require("./accounts");

// Mount routes
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/reports", reportRoutes);
router.use("/accounts", accountRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
