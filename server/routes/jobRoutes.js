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
  applyToJob
} from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);

// Protected routes for job seekers (MUST come before /:id route)
router.get('/user/recommendations', protect, authorizeRoles('jobseeker'), getRecommendations);
router.get('/user/saved', protect, authorizeRoles('jobseeker'), getSavedJobs);
router.post('/:id/save', protect, authorizeRoles('jobseeker'), saveJob);
router.delete('/:id/save', protect, authorizeRoles('jobseeker'), unsaveJob);

// Public route with ID parameter (MUST come after specific routes)
router.get('/:id', getJobById);

// Protected routes for companies (you can adjust roles as needed)
router.post('/', protect, authorizeRoles('company'), createJob);
router.put('/:id', protect, authorizeRoles('company'), updateJob);
router.delete('/:id', protect, authorizeRoles('company'), deleteJob);
//apply
router.post('/:id/apply', protect, applyToJob);

export default router;