import express from "express";
import { getCompanyProfile, updateCompany } from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/companies/profile", protect, authorizeRoles("company"), getCompanyProfile);

router.put("/companies/profile", protect, authorizeRoles("company"), updateCompany);

export default router;
