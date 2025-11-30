import Company from "../models/Company.js"; // adjust path if needed
import bcrypt from "bcryptjs";

// Create a new company
export const createCompany = async (req, res) => {
  try {
    // Extract data from request body
    const {
      email,
      password,
      companyName,
      location,
      description,
      industry,
      totalEmployees,
      logo
    } = req.body;

    // Check if company with this email already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company with this email already exists" });
    }

    // Create new company
    const newCompany = new Company({
      email,
      password,
      companyName,
      location,
      description,
      industry,
      totalEmployees,
      logo
    });

    // Save to database
    await newCompany.save();

    res.status(201).json({
      message: "Company created successfully",
      company: newCompany
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit company details
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Handle password update
    if (updates.password) {
      const { currentPassword } = updates;
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to update password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, company.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);

      // Remove currentPassword so it is not stored
      delete updates.currentPassword;
    }

    // Prevent updating email or userType
    delete updates.email;
    delete updates.userType;

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: updatedCompany,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

