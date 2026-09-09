import nodemailer from "nodemailer";

/**
 * Creates the Nodemailer SMTP transporter
 * using environment variables.
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  // Gmail:
  // Port 587  -> secure: false (STARTTLS)
  // Port 465  -> secure: true
  const secure = process.env.SMTP_SECURE === "true";

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP credentials are missing. Please set SMTP_USER and SMTP_PASSWORD."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,

    auth: {
      user,
      pass,
    },

    // Connection timeouts
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,

    // Required for STARTTLS on port 587
    requireTLS: !secure,
  });

  return transporter;
};

// Cached transporter instance
let transporterInstance = null;

/**
 * Returns the existing transporter or creates a new one.
 */
export const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = createTransporter();
  }

  return transporterInstance;
};

/**
 * Verifies the SMTP connection.
 */
export const verifyMailConnection = async () => {
  try {
    const transporter = getTransporter();

    await transporter.verify();

    console.log("✅ SMTP Server connected successfully via Nodemailer.");

    return true;
  } catch (error) {
    console.error("❌ SMTP Connection Error:", error.message);

    return false;
  }
};