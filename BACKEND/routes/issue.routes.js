import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import issueModel from "../models/issueModel.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// --- USER ROUTES ---

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, reportedBy, severity, estimatedTime } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    const newIssue = await issueModel.create({
      title, description, category, latitude, longitude, address,
      severity: Number(severity), estimatedTime, reportedBy,
      imageUrl: `/uploads/${req.file.filename}`,
    });
    res.status(201).json(newIssue);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/", async (req, res) => {
  try {
    const issues = await issueModel.find({});
    res.status(200).json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/getData", async (req, res) => {
  try {
    const { username } = req.body;
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
    const radiusInKm = 5;

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

// 1. Get issues needing assignment
router.get("/unassigned", async (req, res) => {
  try {
    // FIXED: Changed 'Issue.find' to 'issueModel.find'
    const issues = await issueModel.find({ 
      workerAssigned: { $exists: false },
      status: { $nin: ["Resolved", "Rejected"] } 
    }).sort({ severity: -1 });
    res.json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. Assign worker
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

// 3. Resolve/Reject Status Update
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

// 4. Fetch unresolved for resolution page
router.get("/unresolved", async (req, res) => {
  try {
    const issues = await issueModel.find({ 
      status: { $nin: ["Resolved", "Rejected"] } 
    }).sort({ severity: -1 });
    res.status(200).json(issues);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;