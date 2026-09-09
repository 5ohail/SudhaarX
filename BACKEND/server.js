import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Config & Database
import connectDB from "./db/db.js";
import { verifyMailConnection } from "./config/mail.js";

// Middleware
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";

// Route Imports
import userRouter from "./routes/user.routes.js";
import issueRouter from "./routes/issue.routes.js";
import authRouter from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// --- ESM PATH FIX ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- DYNAMIC UPLOADS DIR CREATION ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  console.log("📁 Creating local uploads directory...");
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.set("trust proxy", 1);
// --- MIDDLEWARE ---
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter

app.use("/api/", apiRateLimiter);

// Public Uploads Static Access
app.use("/uploads", express.static(uploadDir));

// --- ROUTES ---
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SudhaarX API Engine active & healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("SudhaarX API Engine is running...");
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ Express Global Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
    },
  });
});

// --- SERVER START ---
const start = async () => {
  try {
    await connectDB();
    await verifyMailConnection();

    app.listen(PORT, () => {
      console.log(`✅ SudhaarX Backend live on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error("❌ Server start error:", err.message);
  }
};

start();