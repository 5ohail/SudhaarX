import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import issueModel from "../models/issueModel.js";

const router = express.Router();

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// POST /api/issues
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, reportedBy } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const newIssue = await issueModel.create({
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      reportedBy,
      imageUrl: `/uploads/${req.file.filename}`, // ✅ Save URL
    });

    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues/getData
router.post("/getData", async (req, res) => {
  try {
    const { username } = req.body;

    const totalIssues = await issueModel.countDocuments({ reportedBy: username });
    const pendingIssues = await issueModel.countDocuments({ reportedBy: username, status: "Pending" });
    const resolvedIssues = await issueModel.countDocuments({ reportedBy: username, status: "Resolved" });
    const rejectedIssues = await issueModel.countDocuments({ reportedBy: username, status: "Rejected" });

    res.status(200).json({
      total: totalIssues,
      pending: pendingIssues,
      resolved: resolvedIssues,
      rejected: rejectedIssues,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues/nearby
router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const radiusInKm = 5; // 5 km

    const issues = await issueModel.aggregate([
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // Earth radius in km
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $degreesToRadians: "$latitude" } },
                        { $sin: { $degreesToRadians: latitude } },
                      ],
                    },
                    {
                      $multiply: [
                        { $cos: { $degreesToRadians: "$latitude" } },
                        { $cos: { $degreesToRadians: latitude } },
                        {
                          $cos: {
                            $subtract: [
                              { $degreesToRadians: "$longitude" },
                              { $degreesToRadians: longitude },
                            ],
                          },
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
      { $match: { distance: { $lte: radiusInKm } } }, // within 5 km
    ]);

    res.status(200).json({ issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues/recent
router.post("/recent", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const issues = await issueModel.find({ reportedBy: username })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(issues);
  } catch (error) {
    console.error("Error fetching recent issues:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
