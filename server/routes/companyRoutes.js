import express from "express";
import { 
  getCompanyProfile, 
  updateCompanyProfile, 
  createJob, 
  getJobSkillsForCompany, 
  uploadCompanyProfilePhoto, 
  uploadCompanyCoverPhoto, 
  addCompanyCertificate,
  deleteCompanyCertificate,
  addCompanyLicense,
  deleteCompanyLicense,
  getCompanyJobs,
  updateJobStatus,
  updateJob,
  deleteJob
} from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js"; // Multer middleware

const router = express.Router();

// Get company profile
router.get("/profile", protect, authorizeRoles("company"), getCompanyProfile);

// Update company info
router.put("/profile", protect, authorizeRoles("company"), updateCompanyProfile);

// Upload profile photo
router.put(
  "/profile/profile-photo",
  protect,
  authorizeRoles("company"),
  uploadCompanyProfilePhoto // handles req.body.image
);

router.put(
  "/profile/cover-photo",
  protect,
  authorizeRoles("company"),
  uploadCompanyCoverPhoto // handles req.body.image
);


// Certificates
router.post("/profile/certificates", protect, authorizeRoles("company"), addCompanyCertificate);
router.delete("/profile/certificates/:certificateId", protect, authorizeRoles("company"), deleteCompanyCertificate);

// Licenses
router.post("/profile/licenses", protect, authorizeRoles("company"), addCompanyLicense);
router.delete("/profile/licenses/:licenseId", protect, authorizeRoles("company"), deleteCompanyLicense);

// Jobs
router.post("/jobs", protect, authorizeRoles("company"), createJob);
router.get("/skills", protect, authorizeRoles("company"), getJobSkillsForCompany);
router.get("/jobs", protect, authorizeRoles("company"), getCompanyJobs);


router.patch("/jobs/:jobId/status", protect, authorizeRoles("company"), updateJobStatus);
router.put("/jobs/:jobId", protect, authorizeRoles("company"), updateJob);
router.delete("/jobs/:jobId", protect, authorizeRoles("company"), deleteJob);
export default router;
