import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Job from "../models/Job.js";
import JobSeeker from "../models/JobSeeker.js";

const router = express.Router();

// @desc    Get Job Recommendations (also accessible from /api/jobseeker/recommendations)
// @route   GET /api/jobs/recommendations
// @access  Private
router.get("/recommendations", protect, async (req, res) => {
  try {
    // This endpoint is kept for backward compatibility
    // The main implementation is in jobSeekerController
    const jobs = await Job.find({ status: 'active' })
      .populate('company', 'companyName logo location industry')
      .sort({ postedDate: -1 })
      .limit(20);

    res.json({ jobs });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Save a Job (also accessible from /api/jobseeker/jobs/:jobId/save)
// @route   POST /api/jobs/:id/save
// @access  Private
router.post("/:id/save", protect, async (req, res) => {
  try {
    const jobId = req.params.id;

    // Check if user is a job seeker
    if (req.user.userType !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can save jobs' });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    if (jobSeeker.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Save job
    jobSeeker.savedJobs.push(jobId);
    await jobSeeker.save();

    res.json({ 
      message: 'Job saved successfully',
      savedJobs: jobSeeker.savedJobs 
    });
  } catch (error) {
    console.error('Save Job Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get Single Job Details
// @route   GET /api/jobs/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName logo location industry description totalEmployees');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    res.json({ job });
  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get All Jobs (with basic filtering)
// @route   GET /api/jobs
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { status = 'active', limit = 20, page = 1 } = req.query;

    const query = { status };
    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .populate('company', 'companyName logo location')
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
