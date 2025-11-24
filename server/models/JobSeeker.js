import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  userType: {
    type: String,
    default: "jobseeker",
    immutable: true,
  },
  // Profile fields (add in Week 2)
  fullName: String,
  skills: [String],
  education: String,
  experience: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("JobSeeker", jobSeekerSchema);