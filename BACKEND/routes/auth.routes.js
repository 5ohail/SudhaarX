import express from 'express';
import crypto from 'crypto';
import { Resend } from 'resend';
import User from '../models/userModel.js';

const authRouter = express.Router();

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 1. SEND OTP TO EMAIL ---
authRouter.post('/send-otp-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 Minutes validity

    // Find user by email and update OTP fields
    const user = await User.findOneAndUpdate(
      { email: cleanEmail }, 
      { otp, otpExpires }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }

    // Send Email using Resend API (Standard HTTPS)
    const { data, error } = await resend.emails.send({
      from: 'SudhaarX <onboarding@resend.dev>', // While testing, you must use this 'from' address
      to: cleanEmail,
      subject: `${otp} is your SudhaarX verification code`,
      html: `
        <div style="font-family: sans-serif; background-color: #f4f7f6; padding: 40px 10px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h1 style="color: #008545; margin: 0;">SudhaarX</h1>
            <h2 style="color: #333333; margin-top: 20px;">Verify Your Identity</h2>
            <p style="color: #666666; font-size: 16px;">Please enter the following code to proceed with your report:</p>
            
            <div style="margin: 30px 0; padding: 20px; border: 2px dashed #008545; border-radius: 12px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #008545; letter-spacing: 5px;">
                ${otp}
              </span>
            </div>

            <p style="color: #999999; font-size: 13px;">This code expires in 10 minutes.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(500).json({ success: false, message: "Failed to send email via API." });
    }

    res.status(200).json({ success: true, message: "OTP sent to your email." });

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// --- 2. VERIFY OTP VIA EMAIL ---
authRouter.post('/verify-otp-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: "No active OTP request." });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "Code has expired." });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    // Clear OTP fields
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification system error." });
  }
});

export default authRouter;