import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import { createNotification, notificationTemplates } from "../utils/notificationService.js";

// Get all applications for company's jobs
export const getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { status, jobId, page = 1, limit = 20 } = req.query;

    // Build filter query
    const filter = { company: companyId };
    
    if (status && status !== "All") {
      const statusMap = {
        'New': 'pending',
        'Reviewing': 'reviewing',
        'Interview Scheduled': 'interview',
        'Hired': 'accepted',
        'Rejected': 'rejected'
      };
      filter.status = statusMap[status] || status.toLowerCase();
    }
    
    if (jobId) {
      filter.job = jobId;
    }

    // Fetch applications with populated data
    const applications = await Application.find(filter)
      .populate({
        path: 'jobSeeker',
        select: 'fullName email phone location skills experience education profilePhoto bio certifications'
      })
      .populate({
        path: 'job',
        select: 'title location employmentType'
      })
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(filter);

    // Transform data to match frontend format
    const transformedApplications = applications.map(app => {
      const jobSeeker = app.jobSeeker;
      
      return {
        id: app._id,
        _id: app._id,
        name: jobSeeker?.fullName || 'Unknown',
        job: app.job?.title || 'Unknown Position',
        jobId: app.job?._id,
        status: capitalizeStatus(app.status),
        rating: calculateRating(jobSeeker),
        experience: calculateExperience(jobSeeker?.experience),
        email: jobSeeker?.email || 'N/A',
        phone: jobSeeker?.phone || 'N/A',
        appliedDate: app.appliedDate.toISOString().split('T')[0],
        skills: jobSeeker?.skills || [],
        profilePhoto: jobSeeker?.profilePhoto || '',
        location: jobSeeker?.location || 'N/A',
        coverLetter: app.coverLetter,
        resume: app.resumeSnapshot?.resumeUrl || '',
        resumeSnapshot: app.resumeSnapshot,
        applicationStatus: app.status,
        statusHistory: app.statusHistory
      };
    });

    res.status(200).json({
      success: true,
      applications: transformedApplications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });

  } catch (error) {
    console.error("Get company applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve applications",
      error: error.message
    });
  }
};

// Get single application details
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const companyId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      company: companyId
    })
      .populate({
        path: 'jobSeeker',
        select: '-password'
      })
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      application
    });

  } catch (error) {
    console.error("Get application details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve application details",
      error: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user.id;

    // Validate status
    const validStatuses = ["pending", "reviewing", "interview", "accepted", "rejected"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      company: companyId
    })
      .populate('jobSeeker', 'fullName email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    const oldStatus = application.status;
    application.status = status.toLowerCase();
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    // Send email notification to job seeker if status changed
    if (oldStatus !== application.status) {
      const emailContent = emailTemplates.statusUpdate({
        candidateName: application.jobSeeker.fullName,
        jobTitle: application.job.title,
        status: capitalizeStatus(application.status),
      });

      await sendEmail({
        to: application.jobSeeker.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Create notification
      const notifContent = notificationTemplates.applicationStatusUpdate({
        jobTitle: application.job.title,
        status: capitalizeStatus(application.status),
      });

      await createNotification({
        recipient: application.jobSeeker._id,
        recipientModel: "JobSeeker",
        sender: companyId,
        senderModel: "Company",
        type: notifContent.type,
        title: notifContent.title,
        message: notifContent.message,
        link: `/applications/${applicationId}`,
        data: { applicationId, status: application.status },
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application
    });

  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message
    });
  }
};

// Make hiring decision
export const makeHiringDecision = async (req, res) => {
  try {
    const { applicationId, decision, feedback } = req.body;
    const companyId = req.user.id;

    // Validate decision
    if (!["accepted", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'accepted' or 'rejected'",
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    application.status = decision;
    if (feedback) {
      application.notes = feedback;
    }
    await application.save();

    // Send email to candidate
    const emailContent = emailTemplates.hiringDecision({
      candidateName: application.jobSeeker.fullName,
      jobTitle: application.job.title,
      decision,
      feedback,
    });

    await sendEmail({
      to: application.jobSeeker.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Create notification
    const notifContent = notificationTemplates.hiringDecision({
      jobTitle: application.job.title,
      decision,
    });

    await createNotification({
      recipient: application.jobSeeker._id,
      recipientModel: "JobSeeker",
      sender: companyId,
      senderModel: "Company",
      type: notifContent.type,
      title: notifContent.title,
      message: notifContent.message,
      link: `/applications/${applicationId}`,
      data: { applicationId, decision },
    });

    res.status(200).json({
      success: true,
      message: `Candidate ${decision === "accepted" ? "accepted" : "rejected"} successfully`,
      application,
    });
  } catch (error) {
    console.error("Make hiring decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to make hiring decision",
      error: error.message,
    });
  }
};

// Get applications statistics
export const getApplicationStats = async (req, res) => {
  try {
    const companyId = req.user.id;

    const stats = await Application.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Application.countDocuments({ company: companyId });

    const formattedStats = {
      total,
      pending: 0,
      reviewing: 0,
      interview: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve application statistics",
      error: error.message
    });
  }
};

// Helper functions
function capitalizeStatus(status) {
  const statusMap = {
    'pending': 'New',
    'reviewing': 'Reviewing',
    'interview': 'Interview Scheduled',
    'accepted': 'Hired',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
}

function calculateExperience(experienceArray) {
  if (!experienceArray || experienceArray.length === 0) {
    return '0 years';
  }
  
  let totalMonths = 0;
  experienceArray.forEach(exp => {
    if (exp.startDate) {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
  });
  
  const years = Math.floor(totalMonths / 12);
  return years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '< 1 year';
}

function calculateRating(jobSeeker) {
  // Simple rating calculation based on profile completeness
  let rating = 3.0; // Base rating
  
  if (jobSeeker?.skills && jobSeeker.skills.length > 0) rating += 0.3;
  if (jobSeeker?.experience && jobSeeker.experience.length > 0) rating += 0.3;
  if (jobSeeker?.education && jobSeeker.education.length > 0) rating += 0.2;
  if (jobSeeker?.bio) rating += 0.2;
  if (jobSeeker?.certifications && jobSeeker.certifications.length > 0) rating += 0.2;
  
  return Math.min(rating, 5.0).toFixed(1);
}

export default {
  getCompanyApplications,
  getApplicationDetails,
  updateApplicationStatus,
  makeHiringDecision,
  getApplicationStats,
};