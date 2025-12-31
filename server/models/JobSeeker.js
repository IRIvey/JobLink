// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const jobSeekerSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//   },
//   userType: {
//     type: String,
//     default: "jobseeker",
//     immutable: true,
//   },
//   // Profile fields
//   fullName: String,
//   phone: String,
//   location: String,
//   bio: String,
//   profilePhoto: String, // Base64 encoded image
//   coverPhoto: String, // Base64 encoded image
//   skills: [String],
//   experience: [{
//     title: String,
//     company: String,
//     location: String,
//     startDate: Date,
//     endDate: Date,
//     current: Boolean,
//     description: String
//   }],
//   education: [{
//     degree: String,
//     school: String,
//     field: String,
//     startDate: Date,
//     endDate: Date,
//     description: String
//   }],
//   certifications: [{
//     name: String,
//     issuer: String,
//     date: Date,
//     url: String
//   }],
//   savedJobs: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Job'
//   }],
//   // Resume fields
//   resume: {
//     personalInfo: {
//       fullName: String,
//       email: String,
//       phone: String,
//       location: String,
//       linkedin: String,
//       github: String,
//       website: String,
//       summary: String,
//       profilePhoto: String, // Photo will be stored here too for resume
//       coverPhoto: String // Cover photo for resume
//     },
//     experience: [{
//       id: String,
//       company: String,
//       position: String,
//       location: String,
//       startDate: String,
//       endDate: String,
//       current: Boolean,
//       description: String
//     }],
//     education: [{
//       id: String,
//       institution: String,
//       degree: String,
//       field: String,
//       location: String,
//       startDate: String,
//       endDate: String,
//       gpa: String,
//       description: String
//     }],
//     skills: [String],
//     certifications: [{
//       id: String,
//       name: String,
//       issuer: String,
//       date: String,
//       expiryDate: String,
//       credentialId: String,
//       url: String
//     }],
//     projects: [{
//       id: String,
//       name: String,
//       description: String,
//       technologies: String,
//       link: String,
//       startDate: String,
//       endDate: String
//     }],
//     languages: [{
//       id: String,
//       language: String,
//       proficiency: String
//     }]
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   }
// });

// jobSeekerSchema.pre("save", async function () {
//   this.updatedAt = new Date();

//   if (!this.isModified("password")) return;

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// export default mongoose.models.JobSeeker || mongoose.model("JobSeeker", jobSeekerSchema);


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

  certifications: {
    type: [
      {
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        date: { type: Date, default: null },
        url: { type: String, default: "" },
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

    certifications: {
      type: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          issuer: { type: String, default: "" },
          date: { type: String, default: "" },
          expiryDate: { type: String, default: "" },
          credentialId: { type: String, default: "" },
          url: { type: String, default: "" },
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
