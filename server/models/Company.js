import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
  match: [
    /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
    "Password must contain at least one digit and one special character (!@#$%^&*)"
  ],
},
  userType: {
    type: String,
    default: "company",
    immutable: true,
  },
  companyName: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
    maxlength: [100, "Company name cannot exceed 100 characters"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  industry: {
  type: String,
  required: [true, "Industry is required"],
  trim: true,
  enum: [
    "IT",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Telecommunications",
    "Transportation",
    "Media",
    "Agriculture",
    "Pharmaceuticals",
    "Construction",
    "Government",
    "Consulting",
    "Other"
  ],
},
  totalEmployees: {
    type: Number,
    required: [true, "Total number of employees is required"],
    min: [1, "There must be at least 1 employee"],
  },
  logo: {
  type: String,
  trim: true,
  default: "", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

companySchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next(); 

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
})

export default mongoose.model("Company", companySchema);