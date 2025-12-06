import JobSeeker from "../models/JobSeeker.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

// @desc    Get JobSeeker Profile
// @route   GET /api/jobseeker/profile
// @access  Private (JobSeeker only)
export const getProfile = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id).select('-password');
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile: jobSeeker });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update JobSeeker Profile
// @route   PUT /api/jobseeker/profile
// @access  Private (JobSeeker only)
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      location,
      bio,
      skills,
      experience,
      education,
      certifications
    } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update only provided fields
    if (fullName !== undefined) jobSeeker.fullName = fullName;
    if (phone !== undefined) jobSeeker.phone = phone;
    if (location !== undefined) jobSeeker.location = location;
    if (bio !== undefined) jobSeeker.bio = bio;
    if (skills !== undefined) jobSeeker.skills = skills;
    if (experience !== undefined) jobSeeker.experience = experience;
    if (education !== undefined) jobSeeker.education = education;
    if (certifications !== undefined) jobSeeker.certifications = certifications;

    await jobSeeker.save();

    // Return updated profile without password
    const updatedProfile = await JobSeeker.findById(req.user.id).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search Jobs with Filters
// @route   GET /api/jobseeker/jobs/search
// @access  Private (JobSeeker only)
export const searchJobs = async (req, res) => {
  try {
    const {
      query,
      location,
      jobType,
      experienceLevel,
      remote,
      salaryMin,
      salaryMax,
      postedWithin,
      page = 1,
      limit = 10,
      sortBy = 'postedDate'
    } = req.query;

    // Build query
    let searchQuery = { status: 'active' };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Job type filter (can be multiple)
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : [jobType];
      searchQuery.type = { $in: types };
    }

    // Experience level filter
    if (experienceLevel) {
      searchQuery.experienceLevel = experienceLevel;
    }

    // Remote filter
    if (remote === 'true') {
      searchQuery.remote = true;
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      searchQuery['salary.min'] = {};
      if (salaryMin) searchQuery['salary.min'].$gte = Number(salaryMin);
      if (salaryMax) searchQuery['salary.max'].$lte = Number(salaryMax);
    }

    // Posted within filter
    if (postedWithin) {
      const now = new Date();
      let dateThreshold;
      
      if (postedWithin === '24 hours') {
        dateThreshold = new Date(now - 24 * 60 * 60 * 1000);
      } else if (postedWithin === '7 days') {
        dateThreshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (postedWithin === '30 days') {
        dateThreshold = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }
      
      if (dateThreshold) {
        searchQuery.postedDate = { $gte: dateThreshold };
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'postedDate':
        sort = { postedDate: -1 };
        break;
      case 'salaryHigh':
        sort = { 'salary.max': -1 };
        break;
      case 'salaryLow':
        sort = { 'salary.min': 1 };
        break;
      default:
        sort = { postedDate: -1 };
    }

    // Execute query
    const jobs = await Job.find(searchQuery)
      .populate('company', 'companyName logo location')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(searchQuery);

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
    console.error('Search Jobs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Job Recommendations
// @route   GET /api/jobseeker/recommendations
// @access  Private (JobSeeker only)
export const getRecommendations = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Build recommendation query based on user's skills and experience
    let recommendationQuery = { status: 'active' };
    
    // Match jobs with user's skills
    if (jobSeeker.skills && jobSeeker.skills.length > 0) {
      recommendationQuery.skills = { 
        $in: jobSeeker.skills.map(skill => new RegExp(skill, 'i'))
      };
    }

    // Match experience level
    if (jobSeeker.experience && jobSeeker.experience.length > 0) {
      // Determine experience level based on years of experience
      const totalYears = jobSeeker.experience.reduce((sum, exp) => {
        if (exp.startDate && exp.endDate) {
          const years = (new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365);
          return sum + years;
        }
        return sum;
      }, 0);

      if (totalYears < 2) {
        recommendationQuery.experienceLevel = { $in: ['Entry Level', 'Mid Level'] };
      } else if (totalYears < 5) {
        recommendationQuery.experienceLevel = { $in: ['Mid Level', 'Senior Level'] };
      } else {
        recommendationQuery.experienceLevel = { $in: ['Senior Level', 'Lead', 'Executive'] };
      }
    }

    // Match location preference
    if (jobSeeker.location) {
      recommendationQuery.$or = [
        { location: { $regex: jobSeeker.location, $options: 'i' } },
        { remote: true }
      ];
    }

    // Get recommended jobs
    const jobs = await Job.find(recommendationQuery)
      .populate('company', 'companyName logo location industry')
      .sort({ postedDate: -1 })
      .limit(20);

    // Calculate match percentage for each job
    const jobsWithMatch = jobs.map(job => {
      let matchScore = 0;
      let matchFactors = 0;

      // Skills match
      if (jobSeeker.skills && job.skills) {
        const matchingSkills = job.skills.filter(jobSkill => 
          jobSeeker.skills.some(userSkill => 
            userSkill.toLowerCase() === jobSkill.toLowerCase()
          )
        );
        const skillMatch = (matchingSkills.length / job.skills.length) * 100;
        matchScore += skillMatch;
        matchFactors++;
      }

      // Location match
      if (jobSeeker.location && (job.location.includes(jobSeeker.location) || job.remote)) {
        matchScore += 100;
        matchFactors++;
      }

      const matchPercentage = matchFactors > 0 ? Math.round(matchScore / matchFactors) : 50;

      return {
        ...job.toObject(),
        matchPercentage
      };
    });

    // Sort by match percentage
    jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ jobs: jobsWithMatch });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Save a Job
// @route   POST /api/jobseeker/jobs/:jobId/save
// @access  Private (JobSeeker only)
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

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
};

// @desc    Unsave a Job
// @route   DELETE /api/jobseeker/jobs/:jobId/save
// @access  Private (JobSeeker only)
export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Remove job from saved jobs
    jobSeeker.savedJobs = jobSeeker.savedJobs.filter(
      id => id.toString() !== jobId
    );
    
    await jobSeeker.save();

    res.json({ 
      message: 'Job removed from saved jobs',
      savedJobs: jobSeeker.savedJobs 
    });
  } catch (error) {
    console.error('Unsave Job Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Saved Jobs
// @route   GET /api/jobseeker/saved-jobs
// @access  Private (JobSeeker only)
export const getSavedJobs = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id)
      .populate({
        path: 'savedJobs',
        populate: {
          path: 'company',
          select: 'companyName logo location'
        }
      });
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ savedJobs: jobSeeker.savedJobs });
  } catch (error) {
    console.error('Get Saved Jobs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Apply to a Job
// @route   POST /api/jobseeker/jobs/:jobId/apply
// @access  Private (JobSeeker only)
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Get job seeker with resume
    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobSeeker: req.user.id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application with resume snapshot
    const application = await Application.create({
      jobSeeker: req.user.id,
      job: jobId,
      company: job.company,
      coverLetter: coverLetter || '',
      resumeSnapshot: jobSeeker.resume || {},
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
    console.error('Apply to Job Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get User's Applications
// @route   GET /api/jobseeker/applications
// @access  Private (JobSeeker only)
export const getApplications = async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Application Details
// @route   GET /api/jobseeker/applications/:applicationId
// @access  Private (JobSeeker only)
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({
      _id: applicationId,
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
    console.error('Get Application Details Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Withdraw Application
// @route   DELETE /api/jobseeker/applications/:applicationId
// @access  Private (JobSeeker only)
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({
      _id: applicationId,
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

    await Application.findByIdAndDelete(applicationId);

    // Decrement applications count on job
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw Application Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Dashboard Statistics
// @route   GET /api/jobseeker/stats
// @access  Private (JobSeeker only)
export const getDashboardStats = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get application statistics
    const totalApplications = await Application.countDocuments({ 
      jobSeeker: req.user.id 
    });

    const pendingApplications = await Application.countDocuments({ 
      jobSeeker: req.user.id,
      status: 'pending'
    });

    const interviewApplications = await Application.countDocuments({ 
      jobSeeker: req.user.id,
      status: 'interview'
    });

    const acceptedApplications = await Application.countDocuments({ 
      jobSeeker: req.user.id,
      status: 'accepted'
    });

    // Get saved jobs count
    const savedJobsCount = jobSeeker.savedJobs?.length || 0;

    // Profile completion calculation
    let profileCompletion = 0;
    const fields = [
      jobSeeker.fullName,
      jobSeeker.phone,
      jobSeeker.location,
      jobSeeker.bio,
      jobSeeker.skills?.length > 0,
      jobSeeker.experience?.length > 0,
      jobSeeker.education?.length > 0,
      jobSeeker.resume?.personalInfo?.fullName
    ];
    
    profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentApplications = await Application.countDocuments({
      jobSeeker: req.user.id,
      appliedDate: { $gte: sevenDaysAgo }
    });

    res.json({
      stats: {
        totalApplications,
        pendingApplications,
        interviewApplications,
        acceptedApplications,
        savedJobsCount,
        profileCompletion,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};