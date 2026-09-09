import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: MongoDB automatically deletes documents when expiresAt <= current date
  },
  resendCooldown: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
