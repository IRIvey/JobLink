import express from "express";
import {
  getCompanyApplications,
  getApplicationDetails,
  updateApplicationStatus,
  makeHiringDecision,
  getApplicationStats,
} from "../controllers/applicationController.js";
import { protect, authorizeCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and company authorization
router.use(protect);
router.use(authorizeCompany);

// Get company's applications
router.get("/company", getCompanyApplications);

// Get application statistics
router.get("/company/stats", getApplicationStats);

// Get single application details
router.get("/:applicationId", getApplicationDetails);

// Update application status
router.patch("/:applicationId/status", updateApplicationStatus);

// Make hiring decision (accept/reject)
router.post("/decision", makeHiringDecision);

export default router;