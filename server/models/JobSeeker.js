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
  // Resume fields
  resume: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
      summary: String
    },
    experience: [{
      id: String,
      company: String,
      position: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String
    }],
    education: [{
      id: String,
      institution: String,
      degree: String,
      field: String,
      location: String,
      startDate: String,
      endDate: String,
      gpa: String,
      description: String
    }],
    skills: [String],
    certifications: [{
      id: String,
      name: String,
      issuer: String,
      date: String,
      expiryDate: String,
      credentialId: String,
      url: String
    }],
    projects: [{
      id: String,
      name: String,
      description: String,
      technologies: String,
      link: String,
      startDate: String,
      endDate: String
    }],
    languages: [{
      id: String,
      language: String,
      proficiency: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
jobSeekerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("JobSeeker", jobSeekerSchema);