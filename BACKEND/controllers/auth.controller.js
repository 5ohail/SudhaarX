import { createAndSaveOTP, verifyOTP as verifyOTPService } from "../services/otp.service.js";
import { sendOTPEmail } from "../services/mail.service.js";
import User from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Helper for validating email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && re.test(email.trim());
};

/**
 * @desc Request Email OTP
 * @route POST /api/auth/request-otp (and POST /api/auth/send-otp-email)
 */
export const requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return errorResponse(res, 400, "Please provide a valid email address.", "INVALID_EMAIL");
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate & hash OTP
    const plainOtp = await createAndSaveOTP(cleanEmail);

    // Send email using Nodemailer + SMTP
    await sendOTPEmail(cleanEmail, plainOtp);

    return successResponse(res, 200, `Verification code sent to ${cleanEmail}`, { email: cleanEmail });
  } catch (error) {
    console.error("❌ OTP Request Error:", error.message);
    return errorResponse(res, 400, error.message || "Failed to send verification code.", "OTP_REQUEST_FAILED");
  }
};

/**
 * @desc Verify OTP & Login / Register User
 * @route POST /api/auth/verify-otp (and POST /api/auth/verify-otp-email)
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, username } = req.body;

    if (!email || !isValidEmail(email)) {
      return errorResponse(res, 400, "Please provide a valid email address.", "INVALID_EMAIL");
    }

    if (!otp || String(otp).trim().length !== 6) {
      return errorResponse(res, 400, "Please enter the complete 6-digit code.", "INVALID_OTP_FORMAT");
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Verify OTP securely
    const verification = await verifyOTPService(cleanEmail, cleanOtp);

    if (!verification.success) {
      return errorResponse(res, 400, verification.message, verification.code);
    }

    // Find or automatically create user (Email-based passwordless OTP registration)
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Derive default username if not provided
      const defaultUsername = username?.trim() || cleanEmail.split("@")[0] + "_" + Math.floor(1000 + Math.random() * 9000);
      
      user = await User.create({
        username: defaultUsername,
        email: cleanEmail,
        userType: "CITIZEN",
      });
      console.log(`👤 New user created via Email OTP: ${cleanEmail}`);
    }

    if (user.isBanned) {
      return errorResponse(res, 403, "Your account has been suspended.", "ACCOUNT_BANNED");
    }

    // Generate JWT Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return successResponse(res, 200, "Authentication successful", {
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      ok: true,
    });
  } catch (error) {
    console.error("❌ OTP Verification Controller Error:", error);
    return errorResponse(res, 500, "Authentication system error.", "AUTH_SYSTEM_ERROR");
  }
};

/**
 * @desc Resend OTP with Cooldown check
 * @route POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res, next) => {
  return requestOTP(req, res, next);
};

/**
 * @desc Refresh Access Token
 * @route POST /api/auth/refresh
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 400, "Refresh token required.", "MISSING_REFRESH_TOKEN");
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.isBanned) {
      return errorResponse(res, 401, "Invalid refresh token or account suspended.", "INVALID_REFRESH_TOKEN");
    }

    const newAccessToken = generateAccessToken(user);
    return successResponse(res, 200, "Token refreshed", { accessToken: newAccessToken });
  } catch (err) {
    return errorResponse(res, 401, "Expired or invalid refresh token.", "EXPIRED_REFRESH_TOKEN");
  }
};

/**
 * @desc Logout User
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
  return successResponse(res, 200, "Logged out successfully");
};

/**
 * @desc Get Authenticated User Details
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return successResponse(res, 200, "User profile retrieved", {
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      userType: req.user.userType,
      profileImage: req.user.profileImage,
      createdAt: req.user.createdAt,
    },
  });
};
