import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import { upload } from "../middleware/upload.js";

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
