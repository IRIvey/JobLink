// import Company from "../models/Company.js";
// import bcrypt from "bcryptjs";
// import { upload } from "../middleware/upload.js";

// export const getCompanyProfile = async (req, res) => {
//   try {
//     const company = await Company.findById(req.companyId).select("-password");

//     if (!company) {
//       return res.status(404).json({ success: false, message: "Company not found" });
//     }

//     res.status(200).json({ success: true, company });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };


// export const updateCompany = [
//   // Multer middleware to handle logo and coverPhoto uploads
//   upload.fields([
//     { name: "logo", maxCount: 1 },
//     { name: "coverPhoto", maxCount: 1 },
//   ]),

//   async (req, res) => {
//     const updates = { ...req.body };

//     try {
//       // company id comes from auth middleware
//       const companyId = req.companyId;

//       const company = await Company.findById(companyId);
//       if (!company) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Company not found" });
//       }

//       // Handle password update
//       if (updates.password) {
//         const { currentPassword } = updates;

//         if (!currentPassword) {
//           return res.status(400).json({
//             success: false,
//             message: "Current password is required to update password",
//           });
//         }

//         const isMatch = await bcrypt.compare(
//           currentPassword,
//           company.password
//         );
//         if (!isMatch) {
//           return res.status(400).json({
//             success: false,
//             message: "Current password is incorrect",
//           });
//         }

//         const salt = await bcrypt.genSalt(10);
//         updates.password = await bcrypt.hash(updates.password, salt);

//         delete updates.currentPassword;
//       }

//       // Handle uploaded files
//       if (req.files) {
//         if (req.files.logo) {
//           updates.logo = req.files.logo[0].path;
//         }
//         if (req.files.coverPhoto) {
//           updates.coverPhoto = req.files.coverPhoto[0].path;
//         }
//       }

//       // Prevent updating protected fields
//       delete updates.email;
//       delete updates.userType;

//       const updatedCompany = await Company.findByIdAndUpdate(
//         companyId,
//         updates,
//         {
//           new: true,
//           runValidators: true,
//         }
//       ).select("-password");

//       res.status(200).json({
//         success: true,
//         data: updatedCompany,
//       });
//     } catch (err) {
//       res.status(400).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   },
// ];
import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import { upload } from "../middleware/upload.js";
import Job from "../models/Job.js";
import { INDUSTRY_SKILLS } from "../models/Job.js";

export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.companyId).select("-password");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.status(200).json({ success: true, company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



// export const updateCompany = async (req, res) => {
//   const { id } = req.params;
//   const updates = { ...req.body };

//   try {
//     const company = await Company.findById(id);
//     if (!company) {
//       return res.status(404).json({ success: false, message: "Company not found" });
//     }

//     if (updates.password) {
//       const { currentPassword } = updates;
//       if (!currentPassword) {
//         return res.status(400).json({ success: false, message: "Current password is required to update password" });
//       }

//       const isMatch = await bcrypt.compare(currentPassword, company.password);
//       if (!isMatch) {
//         return res.status(400).json({ success: false, message: "Current password is incorrect" });
//       }

//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(updates.password, salt);

//       delete updates.currentPassword;
//     }

//     delete updates.email;
//     delete updates.userType;

//     const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     res.status(200).json({
//       success: true,
//       data: updatedCompany,
//     });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

export const updateCompany = [
  // Multer middleware to handle logo and coverPhoto uploads
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),

  async (req, res) => {
    const updates = { ...req.body };

    try {
      // company id comes from auth middleware
      const companyId = req.companyId;

      const company = await Company.findById(companyId);
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found" });
      }

      // Handle password update
      if (updates.password) {
        const { currentPassword } = updates;

        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: "Current password is required to update password",
          });
        }

        const isMatch = await bcrypt.compare(
          currentPassword,
          company.password
        );
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
          });
        }

        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);

        delete updates.currentPassword;
      }

      // Handle uploaded files
      if (req.files) {
        if (req.files.logo) {
          updates.logo = req.files.logo[0].path;
        }
        if (req.files.coverPhoto) {
          updates.coverPhoto = req.files.coverPhoto[0].path;
        }
      }

      // Prevent updating protected fields
      delete updates.email;
      delete updates.userType;

      const updatedCompany = await Company.findByIdAndUpdate(
        companyId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      res.status(200).json({
        success: true,
        data: updatedCompany,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
];


export const createJob = async (req, res) => {
  try {
    // 1. Logged-in company ID (from protect middleware)
    const companyId = req.companyId;

    // 2. Fetch company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 3. Get industry
    const industry = company.industry;

    // 4. Get skillset based on industry
    const industrySkills = INDUSTRY_SKILLS[industry] || INDUSTRY_SKILLS.Other;

    // 5. Optional: allow frontend to send selected skills
    let skills = req.body.skills;

    // If skills not sent → assign default industry skills
    if (!skills || skills.length === 0) {
      skills = industrySkills;
    } 
    // If sent → validate skills against industry
    else {
      skills = skills.filter(skill => industrySkills.includes(skill));
    }

    // Parse salary from frontend single input field
    let salaryInput = req.body.salary; // e.g. "$80k - $120k"
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
  // 6. Create job
    const job = await Job.create({
      company: companyId,
      title: req.body.title,
      description: req.body.description,
      location: company.location,
      type: req.body.type,
      experience: req.body.experience,
      salary: req.body.salary,
      skills,
      status: "active"
    });

    res.status(201).json({
      success: true,
      job
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message
    });
  }
};

export const getJobSkillsForCompany = async (req, res) => {
  try {
    // company id from auth middleware
    // Example: Company has a `user` field that links to the logged-in user
    const company = await Company.findOne(req.companyId).select("industry");
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const industry = company.industry;

    const skills =
      INDUSTRY_SKILLS[industry] || INDUSTRY_SKILLS.Other;

    res.status(200).json({
      success: true,
      industry,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
      error: error.message,
    });
  }
};

