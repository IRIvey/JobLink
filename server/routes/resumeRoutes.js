import express from "express";
import {
  getResume,
  updateResume,
  updatePersonalInfo,
  addExperience,
  addEducation,
  updateSkills,
  addCertification,
  exportResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Export resume
router.get("/export", exportResume);

// Get + update full resume
router.get("/", getResume);
router.put("/", updateResume);

// Personal info
router.put("/personal-info", updatePersonalInfo);

// Experience (ONLY add exists in your controller)
router.post("/experience", addExperience);

// Education (ONLY add exists in your controller)
router.post("/education", addEducation);

// Skills
router.put("/skills", updateSkills);

// Certifications (ONLY add exists in your controller)
router.post("/certifications", addCertification);

export default router;
