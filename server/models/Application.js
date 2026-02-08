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
    // This will store the resume data at the time of application
    // Example: { resumeUrl: "https://...", fileName: "resume.pdf" }
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["pending", "reviewing", "interview", "accepted", "rejected"],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "statusHistory.updatedByModel",
      },
      updatedByModel: {
        type: String,
        enum: ["Company", "JobSeeker", "System"],
      },
    },
  ],
  notes: {
    type: String,
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
    // Feedback from company to job seeker (especially for rejections/acceptances)
  },
  interviewScheduled: {
    type: Boolean,
    default: false,
  },
  hiringDecision: {
    decision: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    decisionDate: Date,
    feedback: String,
  },
  emailsSent: [
    {
      type: {
        type: String,
        enum: ["interview", "status_update", "hiring_decision", "custom"],
      },
      subject: String,
      sentAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["sent", "failed"],
        default: "sent",
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications (same job seeker can't apply to same job twice)
applicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });

// Index for faster queries
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ jobSeeker: 1, status: 1 });
applicationSchema.index({ appliedDate: -1 });

// ✅ IMPORTANT: use function() { ... } (NOT arrow function)
// This middleware runs before saving and updates the statusHistory
applicationSchema.pre("save", function (next) {
  // Update the updatedAt timestamp
  this.updatedAt = Date.now();

  // If status has changed and this is not a new document
  if (this.isModified("status") && !this.isNew) {
    // Add the new status to history
    this.statusHistory.push({
      status: this.status,
      updatedAt: Date.now(),
      notes: this.notes || "",
    });
  }

  next();
});

// Virtual for getting the current status display name
applicationSchema.virtual("statusDisplay").get(function () {
  const statusMap = {
    pending: "New",
    reviewing: "Reviewing",
    interview: "Interview Scheduled",
    accepted: "Hired",
    rejected: "Rejected",
  };
  return statusMap[this.status] || this.status;
});

// Virtual for calculating days since application
applicationSchema.virtual("daysSinceApplied").get(function () {
  const now = new Date();
  const applied = new Date(this.appliedDate);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to add email to history
applicationSchema.methods.addEmailRecord = function (emailType, subject, status = "sent") {
  this.emailsSent.push({
    type: emailType,
    subject: subject,
    sentAt: Date.now(),
    status: status,
  });
  return this.save();
};

// Method to update status with notes
applicationSchema.methods.updateStatus = function (newStatus, notes = "", updatedBy = null) {
  this.status = newStatus;
  this.notes = notes;
  
  // The pre-save middleware will automatically add to statusHistory
  return this.save();
};

// Method to set hiring decision
applicationSchema.methods.setHiringDecision = function (decision, feedback = "") {
  this.hiringDecision = {
    decision: decision,
    decisionDate: Date.now(),
    feedback: feedback,
  };
  
  // Also update the main status
  this.status = decision;
  this.feedback = feedback;
  
  return this.save();
};

// Static method to get application statistics for a company
applicationSchema.statics.getCompanyStats = async function (companyId) {
  const stats = await this.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await this.countDocuments({ company: companyId });

  const formattedStats = {
    total,
    pending: 0,
    reviewing: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = stat.count;
  });

  return formattedStats;
};

// Static method to get recent applications
applicationSchema.statics.getRecentApplications = async function (companyId, limit = 10) {
  return this.find({ company: companyId })
    .populate("jobSeeker", "fullName email profilePhoto")
    .populate("job", "title")
    .sort({ appliedDate: -1 })
    .limit(limit);
};

// Static method to get applications by status
applicationSchema.statics.getByStatus = async function (companyId, status) {
  return this.find({ company: companyId, status: status })
    .populate("jobSeeker", "fullName email phone profilePhoto skills experience")
    .populate("job", "title location employmentType")
    .sort({ appliedDate: -1 });
};

// Enable virtuals in JSON output
applicationSchema.set("toJSON", { virtuals: true });
applicationSchema.set("toObject", { virtuals: true });

export default mongoose.model("Application", applicationSchema);