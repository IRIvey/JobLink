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

// --- GET Company Profile Public ---
export const getCompanyProfilePublic = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId)
      .select("-password -email -__v"); // hide private fields

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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

    const { name, link, awardedBy, awardedDate } = req.body;

    // Validation
    if (!name || !link || !awardedBy || !awardedDate)
      return res.status(400).json({ message: "name, link, awardedBy & awardedDate are required" });

    company.certificates.unshift({
      name: name.trim(),
      link: link.trim(),
      awardedBy: awardedBy.trim(),
      awardedDate: new Date(awardedDate),
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

    const { name, licenseNumber, issuedBy, fileUrl, issueDate, expiryDate } = req.body;

    // Validation
    if (!name || !issueDate)
      return res.status(400).json({ message: "License name and issueDate are required" });

    company.licenses.unshift({
      name: name.trim(),
      licenseNumber: licenseNumber?.trim() || "",
      issuedBy: issuedBy?.trim() || "",
      fileUrl: fileUrl?.trim() || "",
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
// export const createJob = async (req, res) => {
//   try {
//     const companyId = req.user?.id;
//     if (!companyId || req.user.userType !== "company")
//       return res.status(401).json({ message: "Unauthorized" });

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ message: "Company not found" });

//     const industry = company.industry;
//     let skills = req.body.skills;

//     if (!skills || skills.length === 0) {
//       skills = INDUSTRY_SKILLS[industry] || INDUSTRY_SKILLS.Other;
//     } else {
//       skills = skills.filter((s) => (INDUSTRY_SKILLS[industry] || []).includes(s));
//     }

  
//     let salaryInput = req.body.salary;
//     let salary = { min: 0, max: 0, currency: "USD" };

//     if (salaryInput) {
//       const numbers = salaryInput
//         .replace(/\$/g, "")
//         .replace(/k/gi, "000")
//         .split("-")
//         .map(s => Number(s.trim()));

//       if (numbers.length === 1) {
//         salary.min = numbers[0];
//         salary.max = numbers[0];
//       } else if (numbers.length === 2) {
//         salary.min = numbers[0];
//         salary.max = numbers[1];
//       }
//     }

//     const job = await Job.create({
//       company: companyId,
//       title: req.body.title,
//       description: req.body.description,
//       location: company.location,
//       type: req.body.type,
//       experience: req.body.experience,
//       salary: salary, 
//       skills,
//       status: "active",
//     });

//     res.status(201).json({ success: true, job });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to create job", error: err.message });
//   }
// };

export const createJob = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // 1. SKILLS LOGIC
    // We take the skills sent by the frontend. 
    // We don't filter them against INDUSTRY_SKILLS here because the frontend 
    // already fetches category-specific skills. We want to allow what the user selected.
    const standardSkills = req.body.skills || [];
    const extraSkills = req.body.extraSkills || [];
    const combinedSkills = [...new Set([...standardSkills, ...extraSkills])];

    // 2. SALARY LOGIC
    // Your frontend is already sending an object: { min, max, currency }.
    // However, we'll add a fallback just in case the frontend sends a string.
    let finalSalary = { min: 0, max: 0, currency: "USD" };

    if (typeof req.body.salary === 'object') {
      finalSalary = {
        min: Number(req.body.salary.min) || 0,
        max: Number(req.body.salary.max) || 0,
        currency: req.body.salary.currency || "USD"
      };
    } else if (typeof req.body.salary === 'string') {
      // Fallback for string input like "$80k - $120k"
      const numbers = req.body.salary
        .replace(/\$/g, "")
        .replace(/k/gi, "000")
        .split("-")
        .map(s => Number(s.replace(/[^0-9]/g, "").trim()));

      finalSalary.min = numbers[0] || 0;
      finalSalary.max = numbers[1] || numbers[0] || 0;
    }

    // 3. JOB CREATION
    // We map the incoming fields to match your Mongoose Schema exactly
    const job = await Job.create({
      company: companyId,
      title: req.body.title,
      description: req.body.description,
      jobTypeCategory: req.body.jobTypeCategory, // Added to match Schema
      location: company.location || "Remote",    // Safety fallback
      type: req.body.type,
      experience: req.body.experience,           // Expecting "entry", "mid", etc.
      salary: finalSalary, 
      skills: combinedSkills,
      status: "active",
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.name === "ValidationError" ? "Validation failed" : "Failed to create job", 
      error: err.message 
    });
  }
};

export const getJobCategories = async (req, res) => {
  try {
    // 1. Get all keys from your INDUSTRY_SKILLS object
    // 2. Filter out 'UNIVERSAL_SKILLS' because that's not a category
    const categories = Object.keys(INDUSTRY_SKILLS).filter(
      (key) => key !== "UNIVERSAL_SKILLS"
    );

    res.status(200).json({ 
      success: true, 
      categories 
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch job categories" 
    });
  }
};

export const getJobSkillsByCategory = async (req, res) => {
  try {
    // 1. Check Authorization
    const companyId = req.user?.id;
    if (!companyId || req.user.userType !== "company") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Get the category from query parameters
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: "Job category is required to fetch skills" 
      });
    }

    // 3. Fetch skills based on the selected category
    // We look up the category in INDUSTRY_SKILLS, fallback to 'Other' if not found
    const categorySkills = INDUSTRY_SKILLS[category] || INDUSTRY_SKILLS.Other;

    // 4. Combine with Universal Skills and remove duplicates
    const skills = [
      ...new Set([
        ...categorySkills,
        ...INDUSTRY_SKILLS.UNIVERSAL_SKILLS,
      ]),
    ];

    res.status(200).json({ 
      success: true, 
      category, 
      skills 
    });

  } catch (err) {
    console.error("Error fetching category skills:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch skills", 
      error: err.message 
    });
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