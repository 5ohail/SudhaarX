import { getTransporter } from "../config/mail.js";

/**
 * Sends a high-quality HTML formatted OTP verification email using Nodemailer & SMTP.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit plaintext OTP
 * @returns {Promise<Object>}
 */
export const sendOTPEmail = async (to, otp) => {
  const cleanEmail = to.toLowerCase().trim();
  const from = process.env.MAIL_FROM || `"SudhaarX" <${process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@sudhaarx.gov.in"}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SudhaarX Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7F6; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #EAEAEA; }
        .header { background-color: #008545; padding: 32px 24px; text-align: center; color: #FFFFFF; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 32px; text-align: center; color: #1F2937; }
        .title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 12px; }
        .text { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 28px; }
        .otp-badge { background: #F0FDF4; border: 2px dashed #008545; border-radius: 14px; padding: 20px; display: inline-block; margin-bottom: 24px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #008545; letter-spacing: 10px; margin-left: 10px; }
        .info-box { background-color: #FEF3C7; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #92400E; margin-top: 20px; display: inline-block; }
        .footer { background-color: #F9FAFB; padding: 20px 32px; border-top: 1px solid #F3F4F6; text-align: center; font-size: 12px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SudhaarX</h1>
          <p>AI-Powered Civic Problem Resolver</p>
        </div>
        <div class="content">
          <div class="title">Verify Your Email Address</div>
          <div class="text">Use the 6-digit verification code below to access your account or complete your report submission:</div>
          
          <div class="otp-badge">
            <span class="otp-code">${otp}</span>
          </div>

          <div class="info-box">
            ⏰ This code will expire in <strong>5 minutes</strong>. Do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          If you did not request this verification code, please ignore this email.<br>
          &copy; ${new Date().getFullYear()} SudhaarX Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: cleanEmail,
    subject: `${otp} is your SudhaarX verification code`,
    html: htmlContent,
  };

  const transporter = getTransporter();
  const info = await transporter.sendMail(mailOptions);
  return info;
};
