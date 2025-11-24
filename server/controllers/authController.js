import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import JobSeeker from "../models/JobSeeker.js";
import Company from "../models/Company.js";

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Register Job Seeker
// @route   POST /api/auth/register/jobseeker
// @access  Public
export const registerJobSeeker = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check if user already exists
    const existingUser = await JobSeeker.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered as Job Seeker" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new job seeker
    const jobSeeker = await JobSeeker.create({
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(jobSeeker._id, "jobseeker");

    res.status(201).json({
      message: "Job Seeker registered successfully",
      token,
      userType: "jobseeker",
      user: {
        id: jobSeeker._id,
        email: jobSeeker.email,
        userType: "jobseeker",
      },
    });
  } catch (error) {
    console.error("Register Job Seeker Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Register Company
// @route   POST /api/auth/register/company
// @access  Public
export const registerCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Email already registered as Company" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new company
    const company = await Company.create({
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(company._id, "company");

    res.status(201).json({
      message: "Company registered successfully",
      token,
      userType: "company",
      user: {
        id: company._id,
        email: company.email,
        userType: "company",
      },
    });
  } catch (error) {
    console.error("Register Company Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login User (both Job Seeker & Company)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check in JobSeeker collection
    let user = await JobSeeker.findOne({ email });
    let userType = "jobseeker";

    // If not found in JobSeeker, check Company collection
    if (!user) {
      user = await Company.findOne({ email });
      userType = "company";
    }

    // User not found
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id, userType);

    res.status(200).json({
      message: "Login successful",
      token,
      userType,
      user: {
        id: user._id,
        email: user.email,
        userType,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const { userType, id } = req.user;

    let user;
    if (userType === "jobseeker") {
      user = await JobSeeker.findById(id).select("-password");
    } else if (userType === "company") {
      user = await Company.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        userType,
        ...user.toObject(),
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};