import express from "express";
import { createCompany, updateCompany } from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: anyone can create a company
router.post("/companies", createCompany);

router.put("/companies/:id", protect, authorizeRoles("company"), updateCompany);

export default router;
