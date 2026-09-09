import crypto from "crypto";
import bcrypt from "bcryptjs";
import OTP from "../models/OTP.js";

const OTP_EXPIRE_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit cryptographically secure OTP string.
 */
export const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Request and store a new OTP for an email address.
 * Enforces resend cooldown.
 */
export const createAndSaveOTP = async (email) => {
  const cleanEmail = email.toLowerCase().trim();

  // Check if active OTP exists with cooldown active
  const existingOTP = await OTP.findOne({ email: cleanEmail });

  if (existingOTP && existingOTP.resendCooldown > new Date()) {
    const secondsRemaining = Math.ceil((existingOTP.resendCooldown - new Date()) / 1000);
    throw new Error(`Please wait ${secondsRemaining} seconds before requesting a new OTP.`);
  }

  // Generate plain 6-digit code
  const plainOtp = generate6DigitOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOtp, salt);

  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  const resendCooldown = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

  // Delete existing OTP record if any for this email
  await OTP.deleteMany({ email: cleanEmail });

  // Save new record
  await OTP.create({
    email: cleanEmail,
    otpHash,
    expiresAt,
    resendCooldown,
    attempts: 0,
    verified: false,
  });

  return plainOtp;
};

/**
 * Verify OTP entered by user.
 * Increments attempt count and locks out after MAX_ATTEMPTS.
 */
export const verifyOTP = async (email, inputOtp) => {
  const cleanEmail = email.toLowerCase().trim();
  const otpRecord = await OTP.findOne({ email: cleanEmail });

  if (!otpRecord) {
    return { success: false, code: "OTP_NOT_FOUND", message: "No active verification request found or code has expired. Please request a new code." };
  }

  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return { success: false, code: "OTP_EXPIRED", message: "Verification code has expired. Please request a new code." };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return { success: false, code: "TOO_MANY_ATTEMPTS", message: "Maximum verification attempts exceeded. Please request a new code." };
  }

  const isMatch = await bcrypt.compare(String(inputOtp), otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = MAX_ATTEMPTS - otpRecord.attempts;
    return {
      success: false,
      code: "INVALID_OTP",
      message: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // OTP verified successfully - invalidate OTP immediately
  await OTP.deleteOne({ _id: otpRecord._id });

  return { success: true, message: "Email verified successfully." };
};
