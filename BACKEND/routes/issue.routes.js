import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import issueModel from "../models/issueModel.js";

const router = express.Router();

// --- CLOUDINARY CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- CLOUDINARY STORAGE ENGINE ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sudhaarx_issues",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }], 
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- USER ROUTES ---

/**
 * @route   POST /api/issues
 * @desc    Create a new civic issue report
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { 
      description, category, latitude, longitude, 
      address, reportedBy, severity, estimatedTime, email 
    } = req.body;

    // Check if file was uploaded to Cloudinary successfully
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: "Image evidence is required." });
    }

    const newIssue = await issueModel.create({
      title: category || "Civic Issue",
      description: description?.trim() || "No description provided",
      category: category || "Miscellaneous Issue",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || "Location not specified",
      severity: Number(severity) || 3,
      estimatedTime: estimatedTime || "Pending Analysis",
      reportedBy: reportedBy || "Anonymous",
      email: email?.toLowerCase().trim() || "",
      imageUrl: req.file.path, // Full HTTPS URL from Cloudinary
      status: "Pending"
    });

    return res.status(201).json({ success: true, data: newIssue });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during report submission." });
  }
});

/**
 * @route   POST /api/issues/nearby
 * @desc    Fetch issues within a 5km radius using Geospatial aggregation
 */
router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: "Valid coordinates are required." });
    }

    const radiusInKm = 5;

    // Haversine formula calculation for distance
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

    return res.status(200).json({ success: true, issues });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/issues/getData
 * @desc    Get stats for a specific user
 */
router.post("/getData", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const [total, pending, resolved, rejected] = await Promise.all([
      issueModel.countDocuments({ reportedBy: username }),
      issueModel.countDocuments({ reportedBy: username, status: "Pending" }),
      issueModel.countDocuments({ reportedBy: username, status: "Resolved" }),
      issueModel.countDocuments({ reportedBy: username, status: "Rejected" })
    ]);
    
    return res.status(200).json({ total, pending, resolved, rejected });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// --- ADMIN & WORKER MANAGEMENT ---

router.get("/unassigned", async (req, res) => {
  try {
    const issues = await issueModel.find({ 
      workerAssigned: { $exists: false },
      status: "Pending" 
    }).sort({ severity: -1 });
    return res.json(issues);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Resolved", "Rejected", "Assigned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const updated = await issueModel.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;