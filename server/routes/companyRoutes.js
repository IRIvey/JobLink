import express from "express";
import { 
  getCompanyProfile, 
  updateCompanyProfile, 
  getCompanyProfilePublic,
  createJob, 
  getJobCategories,
  getJobSkillsByCategory, 
  uploadCompanyProfilePhoto, 
  uploadCompanyCoverPhoto, 
  addCompanyCertificate,
  deleteCompanyCertificate,
  addCompanyLicense,
  deleteCompanyLicense,
  getCompanyJobs,
  updateJobStatus,
  updateJob,
  deleteJob,
  getCompanyJobsDashboard, // ✅ NEW
  getDashboardStats,        // ✅ NEW
  getCompanyApplications
} from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get company profile
router.get("/profile", protect, authorizeRoles("company"), getCompanyProfile);

// Public company profile
router.get("/profile-public/:id", getCompanyProfilePublic);

// Update company info
router.put("/profile", protect, authorizeRoles("company"), updateCompanyProfile);

// Upload profile photo
router.put(
  "/profile/profile-photo",
  protect,
  authorizeRoles("company"),
  uploadCompanyProfilePhoto
);

router.put(
  "/profile/cover-photo",
  protect,
  authorizeRoles("company"),
  uploadCompanyCoverPhoto
);

// Certificates
router.post("/profile/certificates", protect, authorizeRoles("company"), addCompanyCertificate);
router.delete("/profile/certificates/:certificateId", protect, authorizeRoles("company"), deleteCompanyCertificate);

// Licenses
router.post("/profile/licenses", protect, authorizeRoles("company"), addCompanyLicense);
router.delete("/profile/licenses/:licenseId", protect, authorizeRoles("company"), deleteCompanyLicense);

// Jobs
router.post("/jobs", protect, authorizeRoles("company"), createJob);
router.get("/categories", protect, authorizeRoles("company"), getJobCategories);
router.get("/skills", protect, authorizeRoles("company"), getJobSkillsByCategory);
router.get("/jobs", protect, authorizeRoles("company"), getCompanyJobs);
router.patch("/jobs/:jobId/status", protect, authorizeRoles("company"), updateJobStatus);
router.put("/jobs/:jobId", protect, authorizeRoles("company"), updateJob);
router.delete("/jobs/:jobId", protect, authorizeRoles("company"), deleteJob);


router.get("/dashboard/stats", protect, authorizeRoles("company"), getDashboardStats);
router.get("/dashboard/applications", protect, authorizeRoles("company"), getCompanyApplications);
router.get("/dashboard/jobs", protect, authorizeRoles("company"), getCompanyJobsDashboard);

export default router;