/**
 * User Model
 * Mongoose schema for user authentication and profile
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PASSWORD_CONFIG, JWT_CONFIG } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [
        PASSWORD_CONFIG.MIN_LENGTH,
        `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
      ],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Note: email index is automatically created by the unique: true constraint

/**
 * Hash password before saving
 */
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password with bcrypt
  const salt = await bcrypt.genSalt(PASSWORD_CONFIG.SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT token for user
 * @returns {string} JWT token
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONFIG.EXPIRE,
  });
};

/**
 * Get user's full name
 * @returns {string} Full name
 */
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Transform user document for JSON response
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
