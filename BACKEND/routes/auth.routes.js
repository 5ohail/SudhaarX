import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import User from '../models/userModel.js';

const authRouter = express.Router();

// --- NODEMAILER CONFIG ---
import dns from 'dns';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Switching back to 465 but with strict IPv4 forcing
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // This is the strongest way to force IPv4 on Node.js/Render
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      callback(err, address, family);
    });
  },
  // Increased timeouts for slow cloud spin-ups
  connectionTimeout: 20000, 
  greetingTimeout: 20000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  }
});

// Check the connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer Final Fix Failed:", error.message);
  } else {
    console.log("SudhaarX Email System: SUCCESS - Connected via IPv4 (Port 465)");
  }
});

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

    // Send Email
    await transporter.sendMail({
  from: `"SudhaarX Security" <${process.env.EMAIL_USER}>`,
  to: cleanEmail,
  subject: `${otp} is your SudhaarX verification code`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 10px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <div style="background-color: #008545; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">SudhaarX</h1>
          <p style="color: #e8f5e9; margin: 5px 0 0 0; font-size: 14px;">Civic Action & Reporting Portal</p>
        </div>

        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: #333333; margin-bottom: 20px;">Verify Your Identity</h2>
          <p style="color: #666666; font-size: 16px; line-height: 1.5;">
            You are receiving this email because a civic issue report is being submitted via your account. 
            Please enter the following verification code to proceed:
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9faf9; border: 2px dashed #008545; border-radius: 12px;">
            <span style="font-size: 42px; font-weight: bold; color: #008545; letter-spacing: 10px; font-family: monospace;">
              ${otp}
            </span>
          </div>

          <p style="color: #999999; font-size: 13px;">
            This code is valid for <strong>10 minutes</strong>.<br>
            If you did not initiate this request, please ignore this email or secure your account.
          </p>
        </div>

        <div style="background-color: #eeeeee; padding: 20px; text-align: center; border-top: 1px solid #dddddd;">
          <p style="color: #888888; font-size: 12px; margin: 0;">
            &copy; 2024 SudhaarX Digital Infrastructure. All Rights Reserved.<br>
            This is an automated security notification.
          </p>
        </div>

      </div>
    </div>
  `
});

    res.status(200).json({ success: true, message: "OTP sent to your email." });

  } catch (error) {
    console.error("Email OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
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

    // Clear OTP fields after successful validation
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification system error." });
  }
});

export default authRouter;