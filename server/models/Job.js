import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, "Job title is required"],
    trim: true,
    maxlength: [100, "Job title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
    trim: true
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  },
  experience: {
    minYears: {
      type: Number,
      required: true,
      min: [0, "Minimum experience cannot be negative"]
    },
    maxYears: {
      type: Number,
      required: true,
      min: [0, "Maximum experience cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= this.experience.minYears;
        },
        message: "Maximum experience must be greater than or equal to minimum experience"
      }
    }
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'closed','hired'],
    default: 'active'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, type: 1, experienceLevel: 1 });
jobSchema.index({ postedDate: -1 });

export default mongoose.model("Job", jobSchema);