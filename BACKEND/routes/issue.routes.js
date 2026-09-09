import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import issueModel from "../models/issueModel.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

// --- CLOUDINARY CONFIG ---
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// --- CLOUDINARY STORAGE ENGINE ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sudhaarx_issues",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @route   POST /api/issues
 * @desc    Create a new civic issue report
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      description,
      category,
      latitude,
      longitude,
      address,
      reportedBy,
      severity,
      estimatedTime,
      email,
    } = req.body;

    if (!req.file || !req.file.path) {
      return errorResponse(res, 400, "Image evidence is required to report an issue.", "MISSING_IMAGE");
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return errorResponse(res, 400, "Valid latitude and longitude coordinates are required.", "INVALID_COORDINATES");
    }

    const newIssue = await issueModel.create({
      title: category || "Civic Issue",
      description: description?.trim() || "No description provided",
      category: category || "Miscellaneous Issue",
      latitude: latNum,
      longitude: lonNum,
      location: {
        type: "Point",
        coordinates: [lonNum, latNum], // GeoJSON order: [lon, lat]
      },
      address: address || "Location not specified",
      severity: Number(severity) || 3,
      estimatedTime: estimatedTime || "3 Days",
      reportedBy: reportedBy || "Anonymous",
      email: email?.toLowerCase().trim() || "",
      imageUrl: req.file.path,
      status: "Pending",
    });

    return successResponse(res, 201, "Report submitted successfully", newIssue);
  } catch (err) {
    console.error("Upload Error:", err);
    return errorResponse(res, 500, "Internal server error during report submission.", "SUBMISSION_FAILED");
  }
});

/**
 * @route   POST /api/issues/nearby
 * @desc    Fetch issues within a radius (default 5km) using MongoDB Geospatial indexing
 */
router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return errorResponse(res, 400, "Valid GPS coordinates are required.", "INVALID_COORDINATES");
    }

    const radiusInMeters = radius * 1000;

    let issues = [];
    try {
      // 1. Primary: Efficient 2dsphere index query
      issues = await issueModel.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $maxDistance: radiusInMeters,
          },
        },
      }).limit(50);
    } catch (geoErr) {
      // 2. Fallback: Haversine distance formula if 2dsphere index is building
      issues = await issueModel.aggregate([
        {
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $max: [
                      -1,
                      {
                        $min: [
                          1,
                          {
                            $add: [
                              { $multiply: [{ $sin: { $degreesToRadians: "$latitude" } }, { $sin: { $degreesToRadians: lat } }] },
                              { $multiply: [{ $cos: { $degreesToRadians: "$latitude" } }, { $cos: { $degreesToRadians: lat } }, { $cos: { $subtract: [{ $degreesToRadians: "$longitude" }, { $degreesToRadians: lon }] } }] },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
        { $match: { distance: { $lte: radius } } },
        { $sort: { distance: 1 } },
        { $limit: 50 },
      ]);
    }

    return successResponse(res, 200, "Nearby issues fetched", { issues });
  } catch (err) {
    console.error("Nearby Issues Error:", err);
    return errorResponse(res, 500, err.message || "Server error fetching nearby issues.");
  }
});

/**
 * @route   POST /api/issues/getData
 * @desc    Get report statistics for a user
 */
router.post("/getData", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return errorResponse(res, 400, "Username required.");

    const [total, pending, resolved, rejected] = await Promise.all([
      issueModel.countDocuments({ reportedBy: username }),
      issueModel.countDocuments({ reportedBy: username, status: "Pending" }),
      issueModel.countDocuments({ reportedBy: username, status: { $in: ["Resolved", "RESOLVED"] } }),
      issueModel.countDocuments({ reportedBy: username, status: { $in: ["Rejected", "REJECTED"] } }),
    ]);

    return res.status(200).json({ total, pending, resolved, rejected });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
});

/**
 * @route   POST /api/issues/recent
 * @desc    Get recent reports for a user
 */
router.post("/recent", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return errorResponse(res, 400, "Username required.");

    const recents = await issueModel.find({ reportedBy: username }).sort({ createdAt: -1 }).limit(10);
    return res.status(200).json(recents);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
});

/**
 * @route   GET /api/issues/unassigned
 * @desc    Get unassigned pending issues for officers/admins
 */
router.get("/unassigned", async (req, res) => {
  try {
    const issues = await issueModel.find({
      workerAssigned: { $in: [null, ""] },
      status: "Pending",
    }).sort({ severity: -1 });
    return res.status(200).json(issues);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
});

/**
 * @route   GET /api/issues/unresolved
 * @desc    Get unresolved issues
 */
router.get("/unresolved", async (req, res) => {
  try {
    const issues = await issueModel.find({
      status: { $in: ["Pending", "Assigned", "IN_PROGRESS", "ASSIGNED"] },
    });
    return res.status(200).json(issues);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
});

/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update report status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Resolved", "Rejected", "Assigned", "IN_PROGRESS", "VERIFIED"];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status update value.");
    }

    const updateData = { status, updatedAt: new Date() };
    if (status === "Resolved" || status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }

    const updated = await issueModel.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
});

/**
 * @route   POST /api/issues/:id/assign/:workerId
 * @desc    Assign officer/worker to an issue
 */
router.post("/:id/assign/:workerId", async (req, res) => {
  try {
    const updated = await issueModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          workerAssigned: req.params.workerId,
          status: "Assigned",
          AssignedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
});

export default router;