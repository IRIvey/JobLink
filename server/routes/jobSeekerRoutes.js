import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getJobSeekerProfile,


  searchJobs,
  getRecommendations,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyToJob,
  getApplications,
  getApplicationDetails,
  withdrawApplication,
  getDashboardStats,
  suggestJobs
} from "../controllers/Jobseekercontroller.js";

const router = express.Router();

// All routes require authentication and jobseeker role
router.use(protect);
router.use(authorizeRoles("jobseeker"));


router.get("/:jobSeekerId/profile", protect, getJobSeekerProfile);


// Job search and recommendations
router.get("/jobs/search", searchJobs);
router.get("/recommendations", getRecommendations);
router.get("/suggest", suggestJobs);
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