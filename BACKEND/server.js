import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import issueRouter from "./routes/issue.routes.js";
import connectDB from "./db/db.js";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.routes.js";


const app = express();
const PORT = process.env.PORT || 10000;

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);
app.use("/api/auth", authRouter);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server start error:", err.message);
  }
};

start();
