import express from "express";
import { searchSavedJobs, searchApplications } from "../controllers/jobSeekerSearchController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/jobseeker/search/saved?q=<term>
router.get("/saved", protect, authorizeRoles("jobseeker"), searchSavedJobs);

// GET /api/jobseeker/search/applications?q=<term>
router.get("/applications", protect, authorizeRoles("jobseeker"), searchApplications);

export default router;import express from "express";
import { searchSavedJobs, searchApplications } from "../controllers/jobSeekerSearchController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/jobseeker/search/saved?q=<term>
router.get("/saved", protect, authorizeRoles("jobseeker"), searchSavedJobs);

// GET /api/jobseeker/search/applications?q=<term>
router.get("/applications", protect, authorizeRoles("jobseeker"), searchApplications);

export default router;
