const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user.routes");
const issueRouter = require("./routes/issue.routes");
const connectDB = require("./db/db");
const path = require('path')
const app = express();
require('dotenv').config();
// CORS should come before routes
const PORT = process.env.PORT || 10000;

// Middleware for JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
// Serve uploaded files so frontend can access them
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);

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
