import express from 'express';
import {
  getAllJobs,
  getJobById,
  getRecommendations,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyToJob,
  getUserApplications

} from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();



// 1. PUBLIC GENERAL ROUTES
router.get('/', getAllJobs);

// 2. SPECIFIC PROTECTED ROUTES (Always put these BEFORE any :id routes)
router.get("/applications", protect, getUserApplications); // Moved from bottom to top
router.get('/user/recommendations', protect, authorizeRoles('jobseeker'), getRecommendations);
router.get('/user/saved', protect, authorizeRoles('jobseeker'), getSavedJobs);

// 3. ROUTES WITH ID PARAMETERS (Put these AFTER specific routes)
router.get('/:id', getJobById); // Now it won't intercept "/applications"

// 4. ACTION ROUTES (POST/PUT/DELETE)
router.post('/', protect, authorizeRoles('company'), createJob);
router.put('/:id', protect, authorizeRoles('company'), updateJob);
router.delete('/:id', protect, authorizeRoles('company'), deleteJob);

router.post('/:id/save', protect, authorizeRoles('jobseeker'), saveJob);
router.delete('/:id/save', protect, authorizeRoles('jobseeker'), unsaveJob);

router.post("/:id/apply", protect, applyToJob);

export default router;
