import express from "express";
import {
  scheduleInterview,
  getCompanyInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
} from "../controllers/interviewController.js";
import { protect, authorizeCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and company authorization
router.use(protect);
router.use(authorizeCompany);

// Schedule interview
router.post("/schedule", scheduleInterview);

// Get company's interviews
router.get("/", getCompanyInterviews);

// Get single interview
router.get("/:interviewId", getInterview);

// Update interview
router.patch("/:interviewId", updateInterview);

// Cancel interview
router.delete("/:interviewId/cancel", cancelInterview);

export default router;