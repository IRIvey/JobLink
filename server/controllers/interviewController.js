import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import { sendEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/notificationService.js";

// Schedule interview
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, date, time, type, location, notes } = req.body;
    const companyId = req.user.id;

    if (!applicationId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Application ID, date, and time are required",
      });
    }

    // ✅ Must populate company too for the name
    const application = await Application.findOne({
      _id: applicationId,
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title _id")
      .populate("company", "companyName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or you don't have permission",
      });
    }

    // Create interview record
    const interview = new Interview({
      application: applicationId,
      jobSeeker: application.jobSeeker._id,
      company: companyId,
      job: application.job._id,
      date,
      time,
      type: type || "video",
      location: location || "",
      notes: notes || "",
    });

    await interview.save();

    // Update application status to "interview"
    application.status = "interview";
    application.interviewScheduled = true;
    await application.save();

    // Format type label for email/notification
    const typeDisplay =
      { video: "Video Call", phone: "Phone Call", "in-person": "In-Person" }[type] || type;
    const locationLabel = type === "video" ? "Meeting Link" : type === "in-person" ? "Location" : null;
    const companyName = application.company?.companyName || "The Company";

    // ✅ Send detailed email to candidate
    await sendEmail({
      to: application.jobSeeker.email,
      subject: `Interview Scheduled - ${application.job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">🎉 Interview Scheduled!</h2>
          <p>Dear <strong>${application.jobSeeker.fullName}</strong>,</p>
          <p>Your interview for <strong>${application.job.title}</strong> at <strong>${companyName}</strong> has been scheduled.</p>
          <div style="background:#F3F4F6; padding:20px; border-radius:8px; margin:20px 0; border-left:4px solid #4F46E5;">
            <h3 style="margin-top:0; color:#374151;">📅 Interview Details</h3>
            <p style="margin:8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin:8px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin:8px 0;"><strong>Format:</strong> ${typeDisplay}</p>
            ${location && locationLabel ? `<p style="margin:8px 0;"><strong>${locationLabel}:</strong> ${location}</p>` : ""}
            ${notes ? `<p style="margin:8px 0;"><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>
          <p>Please be available at the scheduled time. Best of luck!</p>
          <p>Best regards,<br><strong>${companyName}</strong></p>
        </div>
      `,
      text: `Interview Scheduled!\n\nDear ${application.jobSeeker.fullName},\n\nYour interview for ${application.job.title} is scheduled.\n\nDate: ${date}\nTime: ${time}\nFormat: ${typeDisplay}\n${location ? `${locationLabel}: ${location}\n` : ""}${notes ? `Notes: ${notes}\n` : ""}\nBest regards,\n${companyName}`,
    });

    // ✅ Create detailed notification with all interview info
    await createNotification({
      recipient: application.jobSeeker._id,
      recipientModel: "JobSeeker",
      sender: companyId,
      senderModel: "Company",
      type: "interview_scheduled",
      title: "🎉 Interview Scheduled!",
      message: `Your interview for ${application.job.title} is on ${date} at ${time} (${typeDisplay})${location ? ` — ${locationLabel}: ${location}` : ""}${notes ? ` — Note: ${notes}` : ""}`,
      link: `/applications`,
      data: {
        interviewId: interview._id,
        applicationId,
        jobTitle: application.job.title,
        date,
        time,
        type: typeDisplay,
        location: location || "",
        notes: notes || "",
        companyName,
      },
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
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .populate("jobSeeker", "fullName email phone profilePhoto")
      .populate("job", "title location")
      .populate("application", "status")
      .sort({ createdAt: -1 })
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
    res.status(500).json({ success: false, message: "Failed to retrieve interviews", error: error.message });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const companyId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, company: companyId })
      .populate("jobSeeker", "-password")
      .populate("job")
      .populate("application");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    res.status(200).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve interview", error: error.message });
  }
};

// Update interview
export const updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { date, time, type, location, notes, status } = req.body;
    const companyId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, company: companyId })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (date) interview.date = date;
    if (time) interview.time = time;
    if (type) interview.type = type;
    if (location !== undefined) interview.location = location;
    if (notes !== undefined) interview.notes = notes;
    if (status) interview.status = status;

    await interview.save();

    if (date || time) {
      await createNotification({
        recipient: interview.jobSeeker._id,
        recipientModel: "JobSeeker",
        sender: companyId,
        senderModel: "Company",
        type: "interview_scheduled",
        title: "📅 Interview Rescheduled",
        message: `Your interview for ${interview.job.title} has been updated to ${interview.date} at ${interview.time}`,
        link: `/applications`,
        data: { interviewId: interview._id, date: interview.date, time: interview.time },
      });
    }

    res.status(200).json({ success: true, message: "Interview updated successfully", interview });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update interview", error: error.message });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { reason } = req.body;
    const companyId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, company: companyId })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    interview.status = "cancelled";
    if (reason) interview.notes = `Cancelled: ${reason}`;
    await interview.save();

    await sendEmail({
      to: interview.jobSeeker.email,
      subject: `Interview Cancelled - ${interview.job.title}`,
      html: `<div style="font-family:Arial,sans-serif;"><h2 style="color:#EF4444;">Interview Cancelled</h2><p>Dear ${interview.jobSeeker.fullName},</p><p>Your interview for <strong>${interview.job.title}</strong> on ${interview.date} at ${interview.time} has been cancelled.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}<p>Best regards,<br>HR Team</p></div>`,
      text: `Interview Cancelled\n\nYour interview for ${interview.job.title} has been cancelled.\n${reason ? "Reason: " + reason : ""}`,
    });

    await createNotification({
      recipient: interview.jobSeeker._id,
      recipientModel: "JobSeeker",
      type: "interview_scheduled",
      title: "❌ Interview Cancelled",
      message: `Your interview for ${interview.job.title} on ${interview.date} at ${interview.time} has been cancelled${reason ? ": " + reason : ""}`,
      link: `/applications`,
      data: { interviewId: interview._id },
    });

    res.status(200).json({ success: true, message: "Interview cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel interview", error: error.message });
  }
};