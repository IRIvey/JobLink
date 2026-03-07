import Job from "../models/Job.js";
import JobSeeker from "../models/JobSeeker.js";
import Application from "../models/Application.js";
import { createNotification } from "../utils/notificationService.js";
import mongoose from "mongoose";




//apply jobs
export const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    // ✅ Populate job with more details for notification
    const job = await Job.findById(jobId)
      .select("company title location type experience salary")
      .populate("company", "companyName");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!job.company) {
      return res.status(400).json({ success: false, message: "Job has no company set" });
    }

    const exists = await Application.findOne({ jobSeeker: userId, job: jobId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    // ✅ Get job seeker details for notification
    const jobSeeker = await JobSeeker.findById(userId).select(
      "fullName email phone location skills experience education profilePhoto resume"
    );

    if (!jobSeeker) {
      return res.status(404).json({ success: false, message: "Job seeker profile not found" });
    }

    // ✅ Get coverLetter from request body if provided
    const { coverLetter } = req.body;

    // ✅ Snapshot the resume data at time of application
    const resumeSnapshot = {
      resumeUrl: jobSeeker.resume?.fileUrl || jobSeeker.resume?.url || "",
      fileName: jobSeeker.resume?.fileName || "resume.pdf",
      uploadedAt: jobSeeker.resume?.uploadedAt || new Date(),
    };

    // Create application with cover letter and resume snapshot
    const appDoc = await Application.create({
      jobSeeker: userId,
      job: jobId,
      company: job.company._id,
      status: "pending",
      coverLetter: coverLetter || "",
      resumeSnapshot: resumeSnapshot,
      appliedDate: new Date(),
    });

    // ✅ Calculate experience years for notification
    const calculateTotalExperience = (experienceArray) => {
      if (!experienceArray || experienceArray.length === 0) return "0 years";
      let totalMonths = 0;
      experienceArray.forEach((exp) => {
        if (exp.startDate) {
          const start = new Date(exp.startDate);
          const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          totalMonths += months;
        }
      });
      const years = Math.floor(totalMonths / 12);
      return years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "< 1 year";
    };

    const totalExperience = calculateTotalExperience(jobSeeker.experience);
    const skillsPreview = jobSeeker.skills?.slice(0, 3).join(", ") || "No skills listed";
    const moreSkills = jobSeeker.skills?.length > 3 ? ` +${jobSeeker.skills.length - 3} more` : "";

    // ✅ Send detailed notification to company (NO EMAIL)
    await createNotification({
      recipient: job.company._id,
      recipientModel: "Company",
      sender: userId,
      senderModel: "JobSeeker",
      type: "new_application",
      title: "🎯 New Application Received!",
      message: `${jobSeeker.fullName} applied for ${job.title} • ${totalExperience} experience • Skills: ${skillsPreview}${moreSkills}`,
      link: `/company/applications`,
      data: {
        applicationId: appDoc._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateName: jobSeeker.fullName,
        candidateEmail: jobSeeker.email,
        candidatePhone: jobSeeker.phone || "Not provided",
        candidateLocation: jobSeeker.location || "Not provided",
        experience: totalExperience,
        skills: jobSeeker.skills || [],
        education: jobSeeker.education?.length || 0,
        profilePhoto: jobSeeker.profilePhoto || "",
        appliedDate: appDoc.appliedDate,
        hasCoverLetter: !!coverLetter,
        hasResume: !!resumeSnapshot.resumeUrl,
      },
    });

    // ✅ Send confirmation notification to job seeker
    await createNotification({
      recipient: userId,
      recipientModel: "JobSeeker",
      sender: job.company._id,
      senderModel: "Company",
      type: "application_submitted",
      title: "✅ Application Submitted Successfully!",
      message: `Your application for ${job.title} at ${job.company.companyName} has been submitted. The company will review your application and get back to you soon.`,
      link: `/applications`,
      data: {
        applicationId: appDoc._id,
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.company.companyName,
        appliedDate: appDoc.appliedDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: appDoc,
    });
  } catch (err) {
    console.error("applyToJob error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to apply",
      error: err.message,
    });
  }
};
// Get all applications for the logged-in user
export const getUserApplications = async (req, res) => {
  try {
    // FIX: Match the ID logic from your applyToJob function
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { status = "all" } = req.query;
    const query = { jobSeeker: userId };
    
    // Ensure "all" doesn't filter by status
    if (status !== "all") query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: "job",
        select: "title location type postedDate",
      })
      .populate({
        path: "company",
        select: "companyName logo location industry",
      })
      .sort({ appliedDate: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications, // Ensure this key matches what frontend expects
    });
  } catch (error) {
    console.error("getUserApplications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
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
  const terms = search.trim().split(/\s+/).filter(Boolean);
  const regexes = terms.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));

  query.$and = regexes.map((r) => ({
    $or: [
      { title: r },
      { description: r },
      { skills: r },
      { location: r },
    ],
  }));
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
