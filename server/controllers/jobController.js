import Job from "../models/Job.js";
import JobSeeker from "../models/JobSeeker.js";




//apply jobs
export const applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // Add your application logic here
    // Example: Save application to database
    
    res.status(200).json({
      success: true,
      message: "Application submitted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message
    });
  }
};
// Get all jobs with filters
export const getAllJobs = async (req, res) => {
  try {
    const {
      location,
      type,
      experience,
      skills,
      search,
      minSalary,
      maxSalary,
      status = "active",
    } = req.query;

    const query = { status };

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Experience filter
    if (experience) {
      query.experience = experience;
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      query.skills = { $in: skillsArray };
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Salary range filter (simple version)
    if (minSalary || maxSalary) {
      if (minSalary) query["salary.min"] = { $gte: Number(minSalary) };
      if (maxSalary) query["salary.max"] = { $lte: Number(maxSalary) };
    }

    const jobs = await Job.find(query)
      // ✅ populate the Job field: "company"
      .populate("company", "companyName logo industry")
      .sort({ postedDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      // ✅ same fix here
      "company",
      "companyName logo industry description website"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

// Get personalized job recommendations (ONLY match skills)
export const getRecommendations = async (req, res) => {
  try {
    console.log("Getting recommendations for user:", req.user);
    const userId = req.user.id;

    const jobSeeker = await JobSeeker.findById(userId).select("skills email");
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker profile not found",
      });
    }

    const skills = Array.isArray(jobSeeker.skills)
      ? jobSeeker.skills.map((s) => String(s).trim()).filter(Boolean)
      : [];

    // If user has no skills, return latest active jobs
    if (skills.length === 0) {
      const jobs = await Job.find({ status: "active" })
        .populate("company", "companyName logo industry")
        .sort({ postedDate: -1 })
        .limit(20);

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
        note: "No skills found for this jobseeker, returning latest active jobs.",
      });
    }

    // ✅ Only match ANY skill
    const jobs = await Job.find({
      status: "active",
      skills: { $in: skills },
    })
      .populate("company", "companyName logo industry")
      .sort({ postedDate: -1 })
      .limit(20);

    console.log(`Found ${jobs.length} recommended jobs`);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message,
    });
  }
};

// Create a new job (for companies)
export const createJob = async (req, res) => {
  try {
    const { company, title, description, location, type, experience, salary, skills } =
      req.body;

    const job = await Job.create({
      company,
      title,
      description,
      location,
      type,
      experience,
      salary,
      skills,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

// Save/bookmark a job
export const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    const jobSeeker = await JobSeeker.findById(userId);

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker profile not found",
      });
    }

    if (!jobSeeker.savedJobs) jobSeeker.savedJobs = [];

    if (jobSeeker.savedJobs.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    jobSeeker.savedJobs.push(jobId);
    await jobSeeker.save();

    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving job",
      error: error.message,
    });
  }
};

// Unsave/remove bookmark from a job
export const unsaveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    const jobSeeker = await JobSeeker.findById(userId);

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker profile not found",
      });
    }

    if (!jobSeeker.savedJobs || !jobSeeker.savedJobs.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Job not found in saved jobs",
      });
    }

    jobSeeker.savedJobs = jobSeeker.savedJobs.filter(
      (id) => id.toString() !== jobId
    );
    await jobSeeker.save();

    res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing saved job",
      error: error.message,
    });
  }
};

// Get user's saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    console.log("Getting saved jobs for user:", req.user);
    const userId = req.user.id;

    const jobSeeker = await JobSeeker.findById(userId).populate({
      path: "savedJobs",
      populate: {
        path: "company",
        // ✅ select companyName, not name
        select: "companyName logo industry",
      },
    });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker profile not found",
      });
    }

    res.status(200).json({
      success: true,
      count: jobSeeker.savedJobs?.length || 0,
      jobs: jobSeeker.savedJobs || [],
    });
  } catch (error) {
    console.error("Error in getSavedJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching saved jobs",
      error: error.message,
    });
  }
};
