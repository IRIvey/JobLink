import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobSeeker",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,


    
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "reviewing", "interview", "accepted", "rejected"],
    default: "pending",
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  resumeSnapshot: {
    type: Object,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  statusHistory: [
    {
      status: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    },
  ],
  notes: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications
applicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });

// ✅ IMPORTANT: use function (next) { ... }  (NOT arrow function)
applicationSchema.pre("save", function () {
  this.updatedAt = Date.now();

  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: Date.now(),
    });
  }
});


export default mongoose.model("Application", applicationSchema);
