import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadCoverPhoto,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  searchJobs,
  getRecommendations,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyToJob,
  getApplications,
  getApplicationDetails,
  withdrawApplication,
  getDashboardStats
} from "../controllers/JobseekerController.js";

const router = express.Router();

// All routes require authentication and jobseeker role
router.use(protect);
router.use(authorizeRoles("jobseeker"));

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/photo", uploadProfilePhoto);
router.post("/profile/cover", uploadCoverPhoto);

// Experience routes
router.post("/experience", addExperience);
router.put("/experience/:experienceId", updateExperience);
router.delete("/experience/:experienceId", deleteExperience);

// Education routes
router.post("/education", addEducation);
router.put("/education/:educationId", updateEducation);
router.delete("/education/:educationId", deleteEducation);

// Certification routes
router.post("/certifications", addCertification);
router.put("/certifications/:certificationId", updateCertification);
router.delete("/certifications/:certificationId", deleteCertification);

// Job search and recommendations
router.get("/jobs/search", searchJobs);
router.get("/recommendations", getRecommendations);

// Saved jobs
router.post("/jobs/:jobId/save", saveJob);
router.delete("/jobs/:jobId/save", unsaveJob);
router.get("/saved-jobs", getSavedJobs);

// Applications
router.post("/jobs/:jobId/apply", applyToJob);
router.get("/applications", getApplications);
router.get("/applications/:applicationId", getApplicationDetails);
router.delete("/applications/:applicationId", withdrawApplication);

// Dashboard stats
router.get("/stats", getDashboardStats);

export default router;