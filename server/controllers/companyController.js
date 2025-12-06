import Company from "../models/Company.js";
import bcrypt from "bcryptjs";

export const createCompany = async (req, res) => {
  try {
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

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company with this email already exists" });
    }
    
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

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (updates.password) {
      const { currentPassword } = updates;
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to update password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, company.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);

      delete updates.currentPassword;
    }

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

