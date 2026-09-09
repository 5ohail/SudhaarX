import nodemailer from "nodemailer";

/**
 * Creates the Nodemailer SMTP transporter.
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
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

    // Force IPv4 instead of IPv6
    family: 4,

    // Timeouts
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,

    // STARTTLS for port 587
    requireTLS: !secure,
  });

  return transporter;
};

let transporterInstance = null;

/**
 * Returns cached transporter.
 */
export const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = createTransporter();
  }

  return transporterInstance;
};

/**
 * Verify SMTP connection.
 */
export const verifyMailConnection = async () => {
  try {
    const transporter = getTransporter();

    await transporter.verify();

    console.log(
      "✅ SMTP Server connected successfully via Nodemailer."
    );

    return true;
  } catch (error) {
    console.error(
      "❌ SMTP Connection Error:",
      error.message
    );

    return false;
  }
};