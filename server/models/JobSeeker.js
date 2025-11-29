import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userType: {
    type: String,
    default: "jobseeker",
    immutable: true,
  },
  // Profile fields
  fullName: String,
  phone: String,
  location: String,
  bio: String,
  skills: [String],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    degree: String,
    school: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("JobSeeker", jobSeekerSchema);