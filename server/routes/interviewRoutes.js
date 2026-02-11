import express from "express";
import {
  scheduleInterview,
  getCompanyInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
} from "../controllers/interviewController.js";

// ✅ Match whatever your existing routes use — check your authRoutes or jobRoutes for the exact import
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/schedule", scheduleInterview);
router.get("/", getCompanyInterviews);
router.get("/:interviewId", getInterview);
router.patch("/:interviewId", updateInterview);
router.delete("/:interviewId/cancel", cancelInterview);

export default router;