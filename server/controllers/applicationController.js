import Application from "../models/Application.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import { createNotification, notificationTemplates } from "../utils/notificationService.js";

// Get all applications for company's jobs
export const getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { status, jobId, page = 1, limit = 20 } = req.query;

    const filter = { company: companyId };

    if (status && status !== "All") {
      const statusMap = {
        New: "pending",
        Reviewing: "reviewing",
        "Interview Scheduled": "interview",
        Hired: "accepted",
        Rejected: "rejected",
      };
      filter.status = statusMap[status] || status.toLowerCase();
    }

    if (jobId) filter.job = jobId;

    const applications = await Application.find(filter)
      .populate({
        path: "jobSeeker",
        select: "fullName email phone location skills experience education profilePhoto coverPhoto bio certifications resume",
      })
      .populate({ path: "job", select: "title location employmentType" })
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(filter);

    const transformedApplications = applications.map((app) => {
      const jobSeeker = app.jobSeeker;

      // ✅ Try multiple places to find the resume URL
      const resumeUrl =
        app.resumeSnapshot?.resumeUrl ||
        app.resumeSnapshot?.url ||
        app.resumeSnapshot?.fileUrl ||
        jobSeeker?.resume?.fileUrl ||
        jobSeeker?.resume?.url ||
        jobSeeker?.resume ||
        "";

      return {
        id: app._id,
        _id: app._id,
        name: jobSeeker?.fullName || "Unknown",
        job: app.job?.title || "Unknown Position",
        jobId: app.job?._id,
        status: capitalizeStatus(app.status),
        rating: calculateRating(jobSeeker),
        experience: calculateExperience(jobSeeker?.experience),
        email: jobSeeker?.email || "N/A",
        phone: jobSeeker?.phone || "N/A",
        appliedDate: app.appliedDate.toISOString().split("T")[0],
        skills: jobSeeker?.skills || [],
        profilePhoto: jobSeeker?.profilePhoto || "",
        location: jobSeeker?.location || "N/A",
        coverLetter: app.coverLetter || "",
        resume: resumeUrl,
        resumeSnapshot: app.resumeSnapshot,
        applicationStatus: app.status,
        statusHistory: app.statusHistory || [],
        // ✅ ADD: Include jobSeeker ID for profile viewing
        jobSeeker: jobSeeker?._id || null,
      };
    });

    res.status(200).json({
      success: true,
      applications: transformedApplications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get company applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve applications",
      error: error.message,
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
      company: companyId,
    })
      .populate({ path: "jobSeeker", select: "-password" })
      .populate("job");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve application details", error: error.message });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user.id;

    const validStatuses = ["pending", "reviewing", "interview", "accepted", "rejected"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const application = await Application.findOne({
      _id: applicationId,
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const oldStatus = application.status;
    application.status = status.toLowerCase();
    if (notes) application.notes = notes;

    await application.save();

    // Notify only if status actually changed
    if (oldStatus !== application.status) {
      const displayStatus = capitalizeStatus(application.status);

      const emailContent = emailTemplates.statusUpdate({
        candidateName: application.jobSeeker.fullName,
        jobTitle: application.job.title,
        status: displayStatus,
      });

      await sendEmail({
        to: application.jobSeeker.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      const notifContent = notificationTemplates.applicationStatusUpdate({
        jobTitle: application.job.title,
        status: displayStatus,
      });

      await createNotification({
        recipient: application.jobSeeker._id,
        recipientModel: "JobSeeker",
        sender: companyId,
        senderModel: "Company",
        type: notifContent.type,
        title: notifContent.title,
        message: notifContent.message,
        link: `/applications`,
        data: { applicationId, status: application.status },
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ success: false, message: "Failed to update application status", error: error.message });
  }
};

// ✅ FIXED: Make hiring decision - was missing proper ObjectId handling
export const makeHiringDecision = async (req, res) => {
  try {
    const { applicationId, decision, feedback } = req.body;
    const companyId = req.user.id;

    // Validate inputs
    if (!applicationId) {
      return res.status(400).json({ success: false, message: "Application ID is required" });
    }

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
      .populate("job", "title")
      .populate("company", "companyName");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // ✅ Update application using the model method
    application.status = decision; // "accepted" or "rejected"
    application.feedback = feedback || "";
    application.hiringDecision = {
      decision,
      decisionDate: new Date(),
      feedback: feedback || "",
    };

    await application.save();

    const companyName = application.company?.companyName || "The Company";

    // ✅ Send detailed email based on decision
    if (decision === "accepted") {
      await sendEmail({
        to: application.jobSeeker.email,
        subject: `🎉 Congratulations! Job Offer - ${application.job.title}`,
        html: `
          <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="color:#10B981;">🎉 Congratulations! You've been selected!</h2>
            <p>Dear <strong>${application.jobSeeker.fullName}</strong>,</p>
            <p>We are thrilled to offer you the position of <strong>${application.job.title}</strong> at <strong>${companyName}</strong>!</p>
            <div style="background:#F0FDF4; padding:20px; border-radius:8px; margin:20px 0; border-left:4px solid #10B981;">
              <p>We were truly impressed by your qualifications and interview performance. We believe you will be an amazing addition to our team.</p>
              ${feedback ? `<p><strong>Message from HR:</strong><br>${feedback}</p>` : ""}
            </div>
            <p>Our HR team will be in touch with you shortly regarding next steps, documentation, and your start date.</p>
            <p>Welcome aboard! 🚀</p>
            <p>Best regards,<br><strong>${companyName}</strong></p>
          </div>
        `,
        text: `Congratulations!\n\nDear ${application.jobSeeker.fullName},\n\nWe are pleased to offer you the position of ${application.job.title} at ${companyName}.\n\n${feedback ? `Message: ${feedback}\n\n` : ""}Welcome aboard!\n\nBest regards,\n${companyName}`,
      });
    } else {
      await sendEmail({
        to: application.jobSeeker.email,
        subject: `Application Update - ${application.job.title}`,
        html: `
          <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="color:#6B7280;">Application Update</h2>
            <p>Dear <strong>${application.jobSeeker.fullName}</strong>,</p>
            <p>Thank you for your interest in the <strong>${application.job.title}</strong> position at <strong>${companyName}</strong> and for taking the time to go through our hiring process.</p>
            <div style="background:#F9FAFB; padding:20px; border-radius:8px; margin:20px 0; border-left:4px solid #9CA3AF;">
              <p>After careful consideration, we have decided to move forward with another candidate whose qualifications more closely match our current needs.</p>
              ${feedback ? `<p><strong>Feedback:</strong><br>${feedback}</p>` : ""}
            </div>
            <p>We appreciate the effort you put into your application and encourage you to apply for future openings that match your profile.</p>
            <p>We wish you all the best in your job search!</p>
            <p>Best regards,<br><strong>${companyName}</strong></p>
          </div>
        `,
        text: `Application Update\n\nDear ${application.jobSeeker.fullName},\n\nThank you for applying to ${application.job.title} at ${companyName}.\n\nAfter careful consideration, we have decided to move forward with another candidate.\n\n${feedback ? `Feedback: ${feedback}\n\n` : ""}We wish you the best!\n\nBest regards,\n${companyName}`,
      });
    }

    // ✅ Create notification
    await createNotification({
      recipient: application.jobSeeker._id,
      recipientModel: "JobSeeker",
      sender: companyId,
      senderModel: "Company",
      type: "hiring_decision",
      title: decision === "accepted" ? "🎉 Congratulations! You're hired!" : "Application Update",
      message:
        decision === "accepted"
          ? `You have been selected for the ${application.job.title} position at ${companyName}! Check your email for details.`
          : `Your application for ${application.job.title} at ${companyName} has been reviewed. Check your email for details.`,
      link: `/applications`,
      data: { applicationId, decision, jobTitle: application.job.title, companyName },
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

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const companyId = req.user.id;

    const stats = await Application.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = await Application.countDocuments({ company: companyId });

    const formattedStats = { total, pending: 0, reviewing: 0, interview: 0, accepted: 0, rejected: 0 };
    stats.forEach((stat) => { formattedStats[stat._id] = stat.count; });

    res.status(200).json({ success: true, stats: formattedStats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve application statistics", error: error.message });
  }
};

// Helper functions
function capitalizeStatus(status) {
  const statusMap = {
    pending: "New",
    reviewing: "Reviewing",
    interview: "Interview Scheduled",
    accepted: "Hired",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
}

function calculateExperience(experienceArray) {
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
}

function calculateRating(jobSeeker) {
  let rating = 3.0;
  if (jobSeeker?.skills?.length > 0) rating += 0.3;
  if (jobSeeker?.experience?.length > 0) rating += 0.3;
  if (jobSeeker?.education?.length > 0) rating += 0.2;
  if (jobSeeker?.bio) rating += 0.2;
  if (jobSeeker?.certifications?.length > 0) rating += 0.2;
  return Math.min(rating, 5.0).toFixed(1);
}




export const getApplicantProfileForCompany = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate("jobSeeker", "-password")
      .select("company jobSeeker");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // ✅ Only the company who owns this application can view it
    if (String(application.company) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({
      success: true,
      jobSeeker: application.jobSeeker,
    });
  } catch (error) {
    console.error("getApplicantProfileForCompany error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Resume for company (from applicationId)
export const getApplicantResumeForCompany = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate("jobSeeker", "resume") // only if you need jobSeeker.resume
      .select("company resumeSnapshot jobSeeker");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (String(application.company) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // ✅ Best source = snapshot taken at apply time
    const resumeUrl =
      application.resumeSnapshot?.resumeUrl ||
      application.resumeSnapshot?.url ||
      null;

    // If you never save snapshot and you store resume somewhere else, use it here:
    // const resumeUrl = application.jobSeeker?.resume?.resumeUrl || null;

    if (!resumeUrl) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    return res.json({ success: true, resumeUrl });
  } catch (error) {
    console.error("getApplicantResumeForCompany error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
