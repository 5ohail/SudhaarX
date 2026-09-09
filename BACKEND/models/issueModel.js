import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["Pending", "VERIFIED", "ASSIGNED", "Assigned", "IN_PROGRESS", "Resolved", "Rejected"],
    default: "Pending",
  },
  severity: { type: Number, required: true, min: 1, max: 5, default: 3 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  // GeoJSON field for efficient 2dsphere geospatial queries
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  address: { type: String, required: true, default: "Location not specified" },
  reportedBy: { type: String, required: true, index: true },
  email: { type: String, lowercase: true, trim: true, default: "" },
  estimatedTime: { type: String, default: "3 Days" },
  workerAssigned: { type: String, default: null },
  AssignedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Index for 2dsphere geospatial location queries
issueSchema.index({ location: "2dsphere" });
// Compound index for sorting & status filtering
issueSchema.index({ status: 1, createdAt: -1 });

const issueModel = mongoose.model("Issue", issueSchema);

export default issueModel;
