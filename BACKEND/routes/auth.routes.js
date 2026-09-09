import express from "express";
import { 
  requestOTP, 
  verifyOTP, 
  resendOTP, 
  refresh, 
  logout, 
  getMe 
} from "../controllers/auth.controller.js";
import { otpRateLimiter } from "../middleware/rateLimit.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

// --- EMAIL OTP AUTHENTICATION ROUTES ---

// 1. Request OTP (Sends 6-digit code via Nodemailer SMTP)
authRouter.post("/request-otp", otpRateLimiter, requestOTP);
authRouter.post("/send-otp-email", otpRateLimiter, requestOTP); // Backward compatibility endpoint

// 2. Verify OTP & Authenticate User
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/verify-otp-email", verifyOTP); // Backward compatibility endpoint

// 3. Resend OTP (Respects 60-second cooldown)
authRouter.post("/resend-otp", otpRateLimiter, resendOTP);

// 4. Refresh Token
authRouter.post("/refresh", refresh);

// 5. Logout
authRouter.post("/logout", logout);

// 6. Current User Profile
authRouter.get("/me", requireAuth, getMe);

export default authRouter;