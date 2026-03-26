import mongoose from "mongoose";

 const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false, default: "" },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved", "Rejected"], default: "Pending" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
  reportedBy: { type: String, required: true }, // userId reference
  severity: { type: Number, required: true, min: 1, max: 5 },
  estimatedTime: { type: String, required: false }, // e.g., "2 days", "1 week" 
  workerAssigned: { type: String, required: false}, // workerId reference
  AssignedAt: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const issueModel = mongoose.model('Issue', IssueSchema);

export default issueModel;
