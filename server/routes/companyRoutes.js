import express from "express";
import { updateCompany } from "../controllers/companyController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/companies/:id", protect, authorizeRoles("company"), updateCompany);

export default router;
