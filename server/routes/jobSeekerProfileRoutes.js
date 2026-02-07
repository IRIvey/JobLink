import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadCoverPhoto,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addSkill,
  deleteSkill,
  addCertification,
  deleteCertification,
} from "../controllers/JobSeekerProfileController.js";

const router = express.Router();

// Middleware: Global for all profile actions
router.use(protect);
router.use(authorizeRoles("jobseeker"));

// --- Core Profile Info ---
router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/photo", uploadProfilePhoto);
router.post("/cover", uploadCoverPhoto);

// --- Work Experience ---
router.post("/experience", addExperience);
router.delete("/experience/:experienceId", deleteExperience);

// --- Education ---
router.post("/education", addEducation);
router.delete("/education/:educationId", deleteEducation);

// --- Skills ---
router.post("/skills", addSkill);
router.delete("/skills/:skillId", deleteSkill);

// --- Certifications ---
router.post("/certifications", addCertification);
router.delete("/certifications/:certificationId", deleteCertification);

export default router;