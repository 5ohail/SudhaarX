import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/profileImages");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get all users
userRouter.post("/", async (req, res) => {
  const userData = await User.find({});
  res.json(userData);
});

// Create user
userRouter.post("/create", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res
      .status(201)
      .json({ message: "User created", user: newUser, token, ok: true });
  } else {
    res.status(400).json({ message: "User not created", ok: false });
  }
});

// Login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res
      .status(200)
      .json({ message: "User found", user, token, ok: true });
  } else {
    res.status(404).json({ message: "User not found", ok: false });
  }
});

// Upload profile image (protected)
userRouter.post(
  "/uploadProfileImage",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ msg: "No file uploaded" });

      const username = req.user.username;
      const imageUrl = `/uploads/profileImages/${req.file.filename}`;

      const updatedUser = await User.findOneAndUpdate(
        { username },
        { profileImage: imageUrl },
        { new: true }
      );

      if (!updatedUser)
        return res.status(404).json({ msg: "User not found" });

      res.json({ msg: "Profile image updated", imageUrl });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Get user by username (protected)
userRouter.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default userRouter;
