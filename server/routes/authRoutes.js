import express from "express";
import {
  registerJobSeeker,
  registerCompany,
  login,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register/jobseeker", registerJobSeeker);
router.post("/register/company", registerCompany);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);

export default router;