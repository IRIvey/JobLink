import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { INDUSTRY_SKILLS } from "../models/Job.js";
import bcrypt from "bcryptjs";

// --- GET Company Profile ---
export const getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?.id; // from protect middleware
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findById(companyId).select("-password");
    if (!company)
      return res.status(404).json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- UPDATE Company Profile ---
export const updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    // Prevent updating sensitive fields
    const blocked = ["email", "password", "userType", "createdAt"];
    blocked.forEach((k) => delete req.body[k]);

    const updated = await Company.findByIdAndUpdate(
      companyId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ success: true, company: updated });
  } catch (err) {
    console.error("updateCompanyProfile error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// --- Upload Profile Photo ---
export const uploadCompanyProfilePhoto = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    if (!req.body?.image) return res.status(400).json({ message: "No image provided" });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { profilePhoto: req.body.image },
      { new: true }
    ).select("-password");

    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);


    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ success: true, company });
  } catch (err) {
    console.error("uploadCompanyProfilePhoto error:", err);
    res.status(500).json({ success: false, message: "Photo upload failed" });
  }
};

// --- Upload Cover Photo ---
export const uploadCompanyCoverPhoto = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    if (!req.body?.image) return res.status(400).json({ message: "No image provided" });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { coverPhoto: req.body.image },
      { new: true }
    ).select("-password");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ success: true, company });
  } catch (err) {
    console.error("uploadCompanyCoverPhoto error:", err);
    res.status(500).json({ success: false, message: "Cover photo upload failed" });
  }
};

// --- Add Certificate ---
export const addCompanyCertificate = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const { name, fileUrl, fileType, awardedBy, awardedDate } = req.body;

    if (!name || !fileUrl || !fileType)
      return res.status(400).json({ message: "name, fileUrl & fileType are required" });

    company.certificates.unshift({
      name: name.trim(),
      fileUrl: fileUrl.trim(),
      fileType,
      awardedBy: awardedBy?.trim() || "",
      awardedDate: awardedDate ? new Date(awardedDate) : null,
    });

    await company.save();
    res.status(201).json({ success: true, certificates: company.certificates });
  } catch (err) {
    console.error("addCompanyCertificate error:", err);
    res.status(500).json({ message: "Error adding certificate" });
  }
};

// --- Delete Certificate ---
export const deleteCompanyCertificate = async (req, res) => {
  try {
    const companyId = req.user?.id;
    const { certificateId } = req.params;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $pull: { certificates: { _id: certificateId } } },
      { new: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ success: true, certificates: company.certificates });
  } catch (err) {
    console.error("deleteCompanyCertificate error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- Add License ---
export const addCompanyLicense = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const {
      name,
      licenseNumber,
      issuedBy,
      fileUrl,
      fileType,
      status,
      issueDate,
      expiryDate,
    } = req.body;

    if (!name || !issueDate)
      return res.status(400).json({ message: "License name and issueDate are required" });

    company.licenses.unshift({
      name: name.trim(),
      licenseNumber: licenseNumber?.trim() || "",
      issuedBy: issuedBy?.trim() || "",
      fileUrl: fileUrl?.trim() || "",
      fileType: fileType || "",
      status: status || "Active",
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await company.save();
    res.status(201).json({ success: true, licenses: company.licenses });
  } catch (err) {
    console.error("addCompanyLicense error:", err);
    res.status(500).json({ message: "Error adding license" });
  }
};

// --- Delete License ---
export const deleteCompanyLicense = async (req, res) => {
  try {
    const companyId = req.user?.id;
    const { licenseId } = req.params;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $pull: { licenses: { _id: licenseId } } },
      { new: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ success: true, licenses: company.licenses });
  } catch (err) {
    console.error("deleteCompanyLicense error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- Jobs ---
export const createJob = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const industry = company.industry;
    let skills = req.body.skills;

    if (!skills || skills.length === 0) {
      skills = INDUSTRY_SKILLS[industry] || INDUSTRY_SKILLS.Other;
    } else {
      skills = skills.filter((s) => (INDUSTRY_SKILLS[industry] || []).includes(s));
    }

  
    let salaryInput = req.body.salary;
    let salary = { min: 0, max: 0, currency: "USD" };

    if (salaryInput) {
      const numbers = salaryInput
        .replace(/\$/g, "")
        .replace(/k/gi, "000")
        .split("-")
        .map(s => Number(s.trim()));

      if (numbers.length === 1) {
        salary.min = numbers[0];
        salary.max = numbers[0];
      } else if (numbers.length === 2) {
        salary.min = numbers[0];
        salary.max = numbers[1];
      }
    }

    const job = await Job.create({
      company: companyId,
      title: req.body.title,
      description: req.body.description,
      location: company.location,
      type: req.body.type,
      experience: req.body.experience,
      salary: salary, 
      skills,
      status: "active",
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create job", error: err.message });
  }
};

export const getJobSkillsForCompany = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findById(companyId).select("industry");
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const industry = company.industry;

    const skills = [
      ...new Set([
        ...(INDUSTRY_SKILLS[industry] || INDUSTRY_SKILLS.Other),
        ...INDUSTRY_SKILLS.UNIVERSAL_SKILLS,
      ]),
    ];

    res.status(200).json({ success: true, industry, skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch skills", error: err.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const jobs = await Job.find({ company: companyId })
      .sort({ postedDate: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};

// Update job status (active/closed)
export const updateJobStatus = async (req, res) => {
  try {
    const companyId = req.user?.id;
    const { jobId } = req.params;
    const { status } = req.body;

    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    // Validate status
    if (!["active", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, company: companyId },
      { status },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update job status" });
  }
};

// Update job details
export const updateJob = async (req, res) => {
  try {
    const companyId = req.user?.id;
    const { jobId } = req.params;

    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const job = await Job.findOneAndUpdate(
      { _id: jobId, company: companyId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const companyId = req.user?.id;
    const { jobId } = req.params;

    if (!companyId || req.user.userType !== "company")
      return res.status(401).json({ message: "Unauthorized" });

    const job = await Job.findOneAndDelete({ _id: jobId, company: companyId });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};