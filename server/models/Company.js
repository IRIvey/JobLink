import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
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
    default: "company",
    immutable: true,
  },
  // Profile fields (add in Week 2)
  companyName: String,
  location: String,
  description: String,
  industry: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Company", companySchema);