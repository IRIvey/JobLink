import express from "express";
import { getCompanyProfile, updateCompany, createJob, getJobSkillsForCompany } from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/companies/profile", protect, authorizeRoles("company"), getCompanyProfile);

router.put("/companies/profile", protect, authorizeRoles("company"), updateCompany);

router.post("/companies/jobs", protect, authorizeRoles("company"), createJob);
router.post("/companies/jobs", protect, authorizeRoles("company"), getJobSkillsForCompany);
export default router;
