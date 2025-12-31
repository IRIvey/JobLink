import express from 'express';
import {
  getResume,
  updateResume,
  updatePersonalInfo,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addProject,
  updateProject,
  deleteProject,
  updateSkills,
  addCertification,
  updateCertification,
  deleteCertification,
  exportResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// IMPORTANT: Specific routes MUST come before parameterized routes
// Export resume - must be before any :id routes
router.get('/export', exportResume);

// Get full resume
router.get('/', getResume);

// Update entire resume
router.put('/', updateResume);

// Personal Information
router.put('/personal-info', updatePersonalInfo);

// Experience
router.post('/experience', addExperience);
router.put('/experience/:experienceId', updateExperience);
router.delete('/experience/:experienceId', deleteExperience);

// Education
router.post('/education', addEducation);
router.put('/education/:educationId', updateEducation);
router.delete('/education/:educationId', deleteEducation);

// Projects
router.post('/projects', addProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);

// Skills
router.put('/skills', updateSkills);

// Certifications
router.post('/certifications', addCertification);
router.put('/certifications/:certificationId', updateCertification);
router.delete('/certifications/:certificationId', deleteCertification);

export default router;