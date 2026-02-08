import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import { createNotification, notificationTemplates } from "../utils/notificationService.js";

// Schedule interview
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, date, time, type, location, notes } = req.body;
    const companyId = req.user.id;

    // Validate required fields
    if (!applicationId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Application ID, date, and time are required",
      });
    }

    // Find application
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

    // Create interview
    const interview = new Interview({
      application: applicationId,
      jobSeeker: application.jobSeeker._id,
      company: companyId,
      job: application.job._id,
      date,
      time,
      type: type || "video",
      location,
      notes,
    });

    await interview.save();

    // Update application status to interview
    application.status = "interview";
    await application.save();

    // Send email to candidate
    const emailContent = emailTemplates.interviewInvitation({
      candidateName: application.jobSeeker.fullName,
      jobTitle: application.job.title,
      date,
      time,
      type: type || "video",
      location,
    });

    await sendEmail({
      to: application.jobSeeker.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Create notification for job seeker
    const notifContent = notificationTemplates.interviewScheduled({
      jobTitle: application.job.title,
      date,
      time,
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
      data: { interviewId: interview._id, applicationId },
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

// Get company interviews
export const getCompanyInterviews = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { company: companyId };
    if (status) {
      filter.status = status;
    }

    const interviews = await Interview.find(filter)
      .populate({
        path: "jobSeeker",
        select: "fullName email phone profilePhoto",
      })
      .populate({
        path: "job",
        select: "title location",
      })
      .populate({
        path: "application",
        select: "status",
      })
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Interview.countDocuments(filter);

    res.status(200).json({
      success: true,
      interviews,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get company interviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interviews",
      error: error.message,
    });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const companyId = req.user.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      company: companyId,
    })
      .populate("jobSeeker", "-password")
      .populate("job")
      .populate("application");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interview",
      error: error.message,
    });
  }
};

// Update interview
export const updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { date, time, type, location, notes, status } = req.body;
    const companyId = req.user.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Update fields
    if (date) interview.date = date;
    if (time) interview.time = time;
    if (type) interview.type = type;
    if (location !== undefined) interview.location = location;
    if (notes !== undefined) interview.notes = notes;
    if (status) interview.status = status;

    await interview.save();

    // If rescheduled, send email
    if (date || time) {
      const emailContent = emailTemplates.interviewInvitation({
        candidateName: interview.jobSeeker.fullName,
        jobTitle: interview.job.title,
        date: interview.date,
        time: interview.time,
        type: interview.type,
        location: interview.location,
      });

      await sendEmail({
        to: interview.jobSeeker.email,
        subject: `[Updated] ${emailContent.subject}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Create notification
      await createNotification({
        recipient: interview.jobSeeker._id,
        recipientModel: "JobSeeker",
        sender: companyId,
        senderModel: "Company",
        type: "interview_scheduled",
        title: "Interview Rescheduled",
        message: `Your interview for ${interview.job.title} has been rescheduled to ${interview.date} at ${interview.time}`,
        link: `/applications/${interview.application}`,
        data: { interviewId: interview._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview",
      error: error.message,
    });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { reason } = req.body;
    const companyId = req.user.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "cancelled";
    if (reason) interview.notes = `Cancelled: ${reason}`;
    await interview.save();

    // Send cancellation email
    await sendEmail({
      to: interview.jobSeeker.email,
      subject: `Interview Cancelled - ${interview.job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Interview Cancelled</h2>
          <p>Dear ${interview.jobSeeker.fullName},</p>
          <p>We regret to inform you that the interview scheduled for ${interview.date} at ${interview.time} for the position of <strong>${interview.job.title}</strong> has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>We apologize for any inconvenience.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `,
      text: `Dear ${interview.jobSeeker.fullName},\n\nYour interview for ${interview.job.title} scheduled on ${interview.date} at ${interview.time} has been cancelled.\n\n${reason ? 'Reason: ' + reason : ''}\n\nBest regards,\nHR Team`,
    });

    // Create notification
    await createNotification({
      recipient: interview.jobSeeker._id,
      recipientModel: "JobSeeker",
      type: "interview_scheduled",
      title: "Interview Cancelled",
      message: `Your interview for ${interview.job.title} has been cancelled`,
      link: `/applications/${interview.application}`,
      data: { interviewId: interview._id },
    });

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
      interview,
    });
  } catch (error) {
    console.error("Cancel interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview",
      error: error.message,
    });
  }
};

export default {
  scheduleInterview,
  getCompanyInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
};