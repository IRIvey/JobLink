import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "recipientModel",
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ["JobSeeker", "Company"],
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "senderModel",
  },
  senderModel: {
    type: String,
    enum: ["JobSeeker", "Company", "System"],
  },
  type: {
    type: String,
    enum: [
      "application_status",
      "interview_scheduled",
      "interview_reminder",
      "hiring_decision",
      "new_application",
      "message",
      "general",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // Link to relevant page
  },
  data: {
    type: Object, // Additional data (applicationId, jobId, etc.)
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);