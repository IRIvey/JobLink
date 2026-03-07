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

applicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ jobSeeker: 1, status: 1 });
applicationSchema.index({ appliedDate: -1 });

applicationSchema.pre("save", function () {
  this.updatedAt = Date.now();

  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: Date.now(),
      notes: this.notes || "",
    });
  }
});

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

applicationSchema.virtual("daysSinceApplied").get(function () {
  const now = new Date();
  const applied = new Date(this.appliedDate);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

applicationSchema.methods.addEmailRecord = function (emailType, subject, status = "sent") {
  this.emailsSent.push({
    type: emailType,
    subject: subject,
    sentAt: Date.now(),
    status: status,
  });
  return this.save();
};

applicationSchema.methods.updateStatus = function (newStatus, notes = "", updatedBy = null) {
  this.status = newStatus;
  this.notes = notes;
  return this.save();
};

applicationSchema.methods.setHiringDecision = function (decision, feedback = "") {
  this.hiringDecision = {
    decision: decision,
    decisionDate: Date.now(),
    feedback: feedback,
  };
  this.status = decision;
  this.feedback = feedback;
  return this.save();
};

// ✅ FIXED: Cast companyId to ObjectId — aggregation pipelines do NOT auto-cast strings like .find() does
applicationSchema.statics.getCompanyStats = async function (companyId) {
  const objectId = new mongoose.Types.ObjectId(companyId);

  const stats = await this.aggregate([
    { $match: { company: objectId } },
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

applicationSchema.statics.getRecentApplications = async function (companyId, limit = 10) {
  return this.find({ company: companyId })
    .populate("jobSeeker", "fullName email profilePhoto")
    .populate("job", "title")
    .sort({ appliedDate: -1 })
    .limit(limit);
};

applicationSchema.statics.getByStatus = async function (companyId, status) {
  return this.find({ company: companyId, status: status })
    .populate("jobSeeker", "fullName email phone profilePhoto skills experience")
    .populate("job", "title location employmentType")
    .sort({ appliedDate: -1 });
};

applicationSchema.set("toJSON", { virtuals: true });
applicationSchema.set("toObject", { virtuals: true });

export default mongoose.model("Application", applicationSchema);