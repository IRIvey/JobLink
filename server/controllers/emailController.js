import Application from "../models/Application.js";
import { sendEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/notificationService.js";

// Send custom email to candidate
export const sendCustomEmail = async (req, res) => {
  try {
    const { applicationId, recipientEmail, subject, body, template } = req.body;
    const companyId = req.user.id;

    // Validate required fields
    if (!recipientEmail || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipient email, subject, and body are required",
      });
    }

    // If applicationId provided, verify it belongs to the company
    if (applicationId) {
      const application = await Application.findOne({
        _id: applicationId,
        company: companyId,
      })
        .populate("jobSeeker", "fullName")
        .populate("job", "title");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Send email
      const emailResult = await sendEmail({
        to: recipientEmail,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${body.replace(/\n/g, "<br>")}
          </div>
        `,
        text: body,
      });

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: emailResult.error,
        });
      }

      // Create notification for job seeker
      await createNotification({
        recipient: application.jobSeeker._id,
        recipientModel: "JobSeeker",
        sender: companyId,
        senderModel: "Company",
        type: "message",
        title: "New Message from Employer",
        message: `You have received a message regarding your application for ${application.job.title}`,
        link: `/applications/${applicationId}`,
        data: { applicationId },
      });

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
        messageId: emailResult.messageId,
      });
    } else {
      // Send email without application context
      const emailResult = await sendEmail({
        to: recipientEmail,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${body.replace(/\n/g, "<br>")}
          </div>
        `,
        text: body,
      });

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: emailResult.error,
        });
      }

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
        messageId: emailResult.messageId,
      });
    }
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};

// Send bulk emails
export const sendBulkEmails = async (req, res) => {
  try {
    const { applicationIds, subject, body } = req.body;
    const companyId = req.user.id;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application IDs array is required",
      });
    }

    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: "Subject and body are required",
      });
    }

    // Find all applications
    const applications = await Application.find({
      _id: { $in: applicationIds },
      company: companyId,
    })
      .populate("jobSeeker", "fullName email")
      .populate("job", "title");

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found",
      });
    }

    // Send emails to all candidates
    const results = [];
    for (const app of applications) {
      try {
        const emailResult = await sendEmail({
          to: app.jobSeeker.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${body.replace(/\n/g, "<br>")}
            </div>
          `,
          text: body,
        });

        // Create notification
        if (emailResult.success) {
          await createNotification({
            recipient: app.jobSeeker._id,
            recipientModel: "JobSeeker",
            sender: companyId,
            senderModel: "Company",
            type: "message",
            title: "New Message from Employer",
            message: `You have received a message regarding your application for ${app.job.title}`,
            link: `/applications/${app._id}`,
            data: { applicationId: app._id },
          });
        }

        results.push({
          applicationId: app._id,
          email: app.jobSeeker.email,
          success: emailResult.success,
        });
      } catch (error) {
        results.push({
          applicationId: app._id,
          email: app.jobSeeker.email,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    res.status(200).json({
      success: true,
      message: `Sent ${successCount} out of ${results.length} emails`,
      results,
    });
  } catch (error) {
    console.error("Send bulk emails error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk emails",
      error: error.message,
    });
  }
};

export default {
  sendCustomEmail,
  sendBulkEmails,
};