import nodemailer from "nodemailer";
import dns from "dns";

let transporterInstance = null;

export const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER or SMTP_PASSWORD is missing."
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      user,
      pass,
    },

    family: 4,

    requireTLS: true,

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  return transporter;
};

export const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = createTransporter();
  }

  return transporterInstance;
};

export const verifyMailConnection = async () => {
  try {
    // Check DNS first
    const addresses = await dns.promises.resolve4("smtp.gmail.com");

    console.log("📡 Gmail IPv4 addresses:", addresses);

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

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      `"SudhaarX" <${process.env.SMTP_USER}>`,

    to,
    subject,
    text,
    html,
  });

  console.log(
    `✅ Email sent successfully to ${to}`
  );

  console.log(
    `📨 Message ID: ${info.messageId}`
  );

  return info;
};