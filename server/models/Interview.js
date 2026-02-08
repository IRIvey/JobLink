import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobSeeker",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "phone", "in-person"],
    default: "video",
  },
  location: {
    type: String, // For in-person or video meeting link
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "rescheduled"],
    default: "scheduled",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

interviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Interview", interviewSchema);