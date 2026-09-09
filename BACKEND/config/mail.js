import nodemailer from "nodemailer";

/**
 * Creates and verifies the SMTP Nodemailer Transporter using environment variables.
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true"; // true for 465, false for 587
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("⚠️ SMTP credentials missing in environment variables (SMTP_USER/EMAIL_USER, SMTP_PASSWORD/EMAIL_PASS). Mail delivery will fail.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Optional TLS settings for self-signed or relaxed local dev
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

let transporterInstance = null;

export const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = createTransporter();
  }
  return transporterInstance;
};

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
