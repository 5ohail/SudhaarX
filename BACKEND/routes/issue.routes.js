import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // Added for folder checking
import { fileURLToPath } from "url";
import issueModel from "../models/issueModel.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CRITICAL: Ensure uploads folder exists on your laptop
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// --- USER ROUTES ---

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description, category, latitude, longitude, address, reportedBy, severity, estimatedTime, email } = req.body;
    
    // Debug: See what is actually hitting your server
    console.log("Incoming Report:", req.body);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // ✅ FIX: Ensure types match your Mongoose Schema
    const newIssue = await issueModel.create({
      title: category || "Civic Issue", 
      description: description || "No description provided",
      category: category || "Miscellaneous Issue",
      latitude: parseFloat(latitude) || 0, 
      longitude: parseFloat(longitude) || 0,
      address: address || "Unknown Location",
      severity: Number(severity) || 3,
      estimatedTime: estimatedTime || "3 Days",
      reportedBy: reportedBy || "Anonymous",
      email: email || "",
      imageUrl: `/uploads/${req.file.filename}`,
      status: "Pending" // Default status
    });

    res.status(201).json({ success: true, data: newIssue });
  } catch (err) { 
    console.error("POST /issues Error:", err.message);
    res.status(500).json({ success: false, message: err.message }); 
  }
});

router.get("/", async (req, res) => {
  try {
    const issues = await issueModel.find({}).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post("/getData", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const total = await issueModel.countDocuments({ reportedBy: username });
    const pending = await issueModel.countDocuments({ reportedBy: username, status: "Pending" });
    const resolved = await issueModel.countDocuments({ reportedBy: username, status: "Resolved" });
    const rejected = await issueModel.countDocuments({ reportedBy: username, status: "Rejected" });
    
    res.status(200).json({ total, pending, resolved, rejected });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const radiusInKm = 5;

    // Haversine formula for MongoDB aggregation
    const issues = await issueModel.aggregate([
      {
        $addFields: {
          distance: {
            $multiply: [6371, {
              $acos: {
                $max: [-1, {
                  $min: [1, {
                    $add: [
                      { $multiply: [{ $sin: { $degreesToRadians: "$latitude" } }, { $sin: { $degreesToRadians: lat } }] },
                      { $multiply: [{ $cos: { $degreesToRadians: "$latitude" } }, { $cos: { $degreesToRadians: lat } }, { $cos: { $subtract: [{ $degreesToRadians: "$longitude" }, { $degreesToRadians: lon }] } }] }
                    ]
                  }]
                }]
              }
            }]
          }
        }
      },
      { $match: { distance: { $lte: radiusInKm } } },
      { $sort: { distance: 1 } }
    ]);
    res.status(200).json({ issues });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- ADMIN ROUTES ---

router.get("/unassigned", async (req, res) => {
  try {
    const issues = await issueModel.find({ 
      workerAssigned: { $exists: false },
      status: { $nin: ["Resolved", "Rejected"] } 
    }).sort({ severity: -1 });
    res.json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:id/assign/:worker", async (req, res) => {
  try {
    const { id, worker } = req.params;
    const updated = await issueModel.findByIdAndUpdate(
      id,
      { $set: { workerAssigned: worker, status: "Assigned" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Issue not found" });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Resolved", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const updated = await issueModel.findByIdAndUpdate(
      id,
      { $set: { status: status, updatedAt: new Date() } },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/unresolved", async (req, res) => {
  try {
    const issues = await issueModel.find({ 
      status: { $nin: ["Resolved", "Rejected"] } 
    }).sort({ severity: -1 });
    res.status(200).json(issues);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;