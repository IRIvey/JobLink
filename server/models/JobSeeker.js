import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  profilePhoto: { type: String, default: "" }, // Base64 encoded image
  coverPhoto: { type: String, default: "" },   // Base64 encoded image

  skills: { type: [String], default: [] },

  experience: {
    type: [
      {
        title: { type: String, default: "" },
        company: { type: String, default: "" },
        location: { type: String, default: "" },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        current: { type: Boolean, default: false },
        description: { type: String, default: "" },
      },
    ],
    default: [],
  },

  education: {
    type: [
      {
        degree: { type: String, default: "" },
        school: { type: String, default: "" },
        field: { type: String, default: "" },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        description: { type: String, default: "" },
      },
    ],
    default: [],
  },

  // ✅ Root-level certifications (removed required: true, added certificateImageUrl)
  certifications: {
    type: [
      {
        id: { type: String, default: "" },
        title: { type: String, trim: true }, // ✅ REMOVED required: true
        issuingOrg: { type: String, trim: true }, // ✅ REMOVED required: true
        issueDate: { type: String, default: "" },
        expiryDate: { type: String, default: "" },
        credentialId: { type: String, default: "" },
        credentialUrl: { type: String, default: "" },
        certificateImageUrl: { type: String, default: "" }, // ✅ ADDED
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },

  savedJobs: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    default: [],
  },

  // Resume fields (defaults added to avoid undefined .map errors)
  resume: {
    personalInfo: {
      type: {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        website: { type: String, default: "" },
        summary: { type: String, default: "" },
        profilePhoto: { type: String, default: "" },
        coverPhoto: { type: String, default: "" },
      },
      default: {},
    },

    experience: {
      type: [
        {
          id: { type: String, default: "" },
          company: { type: String, default: "" },
          position: { type: String, default: "" },
          location: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          current: { type: Boolean, default: false },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },

    education: {
      type: [
        {
          id: { type: String, default: "" },
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          field: { type: String, default: "" },
          location: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          gpa: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },

    skills: { type: [String], default: [] },

    // ✅ Resume certifications (removed required: true, added certificateImageUrl)
    certifications: {
      type: [
        {
          id: { type: String, default: "" },
          title: { type: String, trim: true }, // ✅ REMOVED required: true
          issuingOrg: { type: String, trim: true }, // ✅ REMOVED required: true
          issueDate: { type: String, default: "" },
          expiryDate: { type: String, default: "" },
          credentialId: { type: String, default: "" },
          credentialUrl: { type: String, default: "" },
          certificateImageUrl: { type: String, default: "" }, // ✅ ADDED
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    projects: {
      type: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: { type: String, default: "" },
          link: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [],
    },

    languages: {
      type: [
        {
          id: { type: String, default: "" },
          language: { type: String, default: "" },
          proficiency: { type: String, default: "" },
        },
      ],
      default: [],
    },

    interests: { type: [String], default: [] },
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

jobSeekerSchema.pre("save", async function () {
  this.updatedAt = new Date();

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.JobSeeker ||
  mongoose.model("JobSeeker", jobSeekerSchema);