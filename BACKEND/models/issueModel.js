import mongoose from "mongoose";

 const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved", "Rejected"], default: "Pending" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
  reportedBy: { type: String, required: true }, // userId reference
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const issueModel = mongoose.model('Issue', IssueSchema);

export default issueModel;
