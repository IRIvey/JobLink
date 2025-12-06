import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

const router = express.Router();

// @desc    Get user's applications with status filter
// @route   GET /api/applications
// @access  Private (JobSeeker only)
router.get("/", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    const { status } = req.query;

    let query = { jobSeeker: req.user.id };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title location type salary postedDate',
        populate: {
          path: 'company',
          select: 'companyName logo'
        }
      })
      .sort({ appliedDate: -1 });

    // Transform data for frontend
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      jobTitle: app.job?.title || 'Position Unavailable',
      company: app.job?.company?.companyName || 'Company Unavailable',
      location: app.job?.location || 'Location not specified',
      status: app.status,
      appliedDate: app.appliedDate,
      updatedAt: app.updatedAt,
      coverLetter: app.coverLetter
    }));

    res.json({ applications: transformedApplications });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (JobSeeker only)
router.get("/:id", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      jobSeeker: req.user.id
    })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'companyName logo location industry description'
        }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get Application Error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (JobSeeker only)
router.post("/", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobSeeker: req.user.id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application
    const application = await Application.create({
      jobSeeker: req.user.id,
      job: jobId,
      company: job.company,
      coverLetter: coverLetter || '',
      statusHistory: [{
        status: 'pending',
        updatedAt: Date.now()
      }]
    });

    // Increment applications count on job
    job.applicationsCount = (job.applicationsCount || 0) + 1;
    await job.save();

    // Populate the application
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title location type salary')
      .populate('company', 'companyName logo');

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication
    });
  } catch (error) {
    console.error('Create Application Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Withdraw/Delete application
// @route   DELETE /api/applications/:id
// @access  Private (JobSeeker only)
router.delete("/:id", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      jobSeeker: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Can only withdraw pending or reviewing applications
    if (['interview', 'accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({ 
        message: 'Cannot withdraw application in current status' 
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Decrement applications count on job
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;