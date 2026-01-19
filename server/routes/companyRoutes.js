import express from "express";
import { getCompanyProfile, updateCompany, createJob, getJobSkillsForCompany } from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, authorizeRoles("company"), getCompanyProfile);

router.put("/profile", protect, authorizeRoles("company"), updateCompany);

router.post("/jobs", protect, authorizeRoles("company"), createJob);
router.get("/skills", protect, authorizeRoles("company"), getJobSkillsForCompany);
export default router;