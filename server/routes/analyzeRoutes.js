import express from "express";
import {
  getAnalyticsOverview,
  getApplicationTrends,
  getJobPerformanceAnalytics,
  getCandidateAnalytics,
  getSourcingAnalytics,
  getTimeToHireMetrics,
} from "../controllers/analyticsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require company authentication
router.use(protect);
router.use(authorizeRoles("company"));

// Main overview endpoint - returns all key metrics
router.get("/overview", getAnalyticsOverview);

// Detailed analytics endpoints
router.get("/trends", getApplicationTrends);
router.get("/jobs", getJobPerformanceAnalytics);
router.get("/candidates", getCandidateAnalytics);
router.get("/sourcing", getSourcingAnalytics);
router.get("/time-to-hire", getTimeToHireMetrics);

export default router;