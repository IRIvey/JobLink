import express from 'express';
import {
  getCompanyApplications,
  getApplicationDetails,
  updateApplicationStatus,
  getApplicationStats
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all applications for company
router.get('/company', getCompanyApplications);

// Get application statistics
router.get('/company/stats', getApplicationStats);

// Get single application details
router.get('/:applicationId', getApplicationDetails);

// Update application status
router.patch('/:applicationId/status', updateApplicationStatus);

export default router;