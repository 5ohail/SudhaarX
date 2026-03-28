import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Route Imports
import userRouter from "./routes/user.routes.js";
import issueRouter from "./routes/issue.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectDB from "./db/db.js";

const app = express();
const PORT = process.env.PORT || 10000;

// --- ESM PATH FIX ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- DYNAMIC FOLDER CREATION ---
// This ensures the 'uploads' folder exists on Render's disk 
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    console.log("📁 Creating uploads directory...");
    fs.mkdirSync(uploadDir, { recursive: true });
}

// DEBUG: Print this to your Render Logs to verify the path
console.log("📍 Uploads Absolute Path:", uploadDir);

// --- MIDDLEWARE ---
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- THE FIX: PUBLIC ACCESS ---
// We use 'uploadDir' directly to avoid relative path errors
app.use("/uploads", express.static(uploadDir));

// --- ROUTES ---
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);
app.use("/api/auth", authRouter);

// Root test route
app.get("/", (req, res) => {
  res.send("SudhaarX API is running...");
});

// --- SERVER START ---
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server live on port ${PORT}`);
      console.log(`🔗 Test uploads at: http://localhost:${PORT}/uploads/your-file.jpg`);
    });
  } catch (err) {
    console.error("❌ Server start error:", err.message);
  }
};

start();