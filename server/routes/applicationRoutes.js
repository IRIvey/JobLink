import express from "express";
import {
  getApplicantProfileForCompany,
  getApplicantResumeForCompany,
  getCompanyApplications,
  getApplicationDetails,
  updateApplicationStatus,
  makeHiringDecision,
  getApplicationStats,
} from "../controllers/applicationController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";


const router = express.Router();

router.use(protect);

// ✅ IMPORTANT: specific routes must come BEFORE param routes
// /company/stats must come BEFORE /:applicationId

router.get("/company/stats", getApplicationStats);      // ← must be before /:applicationId
router.get("/company", getCompanyApplications);
router.get("/:applicationId", getApplicationDetails);
router.patch("/:applicationId/status", updateApplicationStatus);
router.post("/decision", makeHiringDecision);
// ✅ Company views applicant profile via applicationId
router.get(
  "/:applicationId/jobseeker-profile",
  protect,
  authorizeRoles("company"),
  getApplicantProfileForCompany
);

// ✅ Company views applicant resume via applicationId
router.get(
  "/:applicationId/resume",
  protect,
  authorizeRoles("company"),
  getApplicantResumeForCompany
);
export default router;
