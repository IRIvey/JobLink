import nodemailer from "nodemailer";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({  // Fixed: Use createTransport instead of createTransporter
    host: process.env.EMAIL_HOST || "smtp.gmail.com",  // Gmail SMTP host
    port: process.env.EMAIL_PORT || 587,  // Port for sending emails
    secure: false,  // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,  // Your email
      pass: process.env.EMAIL_PASS,  // Your app password
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();  // Create transporter using the configuration

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Job Portal'}" <${process.env.EMAIL_USER}>`,  // Sender's name and email
      to,  // Recipient's email
      subject,  // Subject of the email
      text,  // Plain text body
      html,  // HTML formatted body
    };

    const info = await transporter.sendMail(mailOptions);  // Send email
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };  // Return success status
  } catch (error) {
    console.error("Email send error:", error);  // Log error
    return { success: false, error: error.message };  // Return error status
  }
};

// Email templates
export const emailTemplates = {
  interviewInvitation: ({ candidateName, jobTitle, date, time, type, location }) => ({
    subject: `Interview Invitation - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Interview Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>We are pleased to invite you for an interview for the position of <strong>${jobTitle}</strong>.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Interview Details:</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Type:</strong> ${type}</p>
          ${location ? `<p><strong>${type === 'video' ? 'Meeting Link' : 'Location'}:</strong> ${location}</p>` : ''}
        </div>
        
        <p>We look forward to discussing your qualifications and learning more about your interest in joining our team.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: `Dear ${candidateName},\n\nWe are pleased to invite you for an interview for the position of ${jobTitle}.\n\nDate: ${date}\nTime: ${time}\nType: ${type}\n${location ? (type === 'video' ? 'Meeting Link: ' : 'Location: ') + location : ''}\n\nBest regards,\nHR Team`,
  }),

  hiringDecision: ({ candidateName, jobTitle, decision, feedback }) => ({
    subject: decision === 'accepted' 
      ? `Congratulations! Job Offer - ${jobTitle}`
      : `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${decision === 'accepted' ? `
          <h2 style="color: #10B981;">Congratulations!</h2>
          <p>Dear ${candidateName},</p>
          <p>We are delighted to offer you the position of <strong>${jobTitle}</strong>!</p>
          <p>We were impressed by your qualifications and believe you will be a great addition to our team.</p>
          ${feedback ? `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p>${feedback}</p></div>` : ''}
          <p>Our HR team will contact you shortly with further details regarding the offer.</p>
        ` : `
          <h2 style="color: #6B7280;">Application Update</h2>
          <p>Dear ${candidateName},</p>
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at our company.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          ${feedback ? `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Feedback:</strong></p><p>${feedback}</p></div>` : ''}
          <p>We appreciate the time you invested in the application process and wish you the best in your job search.</p>
        `}
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: decision === 'accepted'
      ? `Dear ${candidateName},\n\nCongratulations! We are delighted to offer you the position of ${jobTitle}.\n\n${feedback || ''}\n\nBest regards,\nHR Team`
      : `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position.\n\n${feedback || ''}\n\nBest regards,\nHR Team`,
  }),

  statusUpdate: ({ candidateName, jobTitle, status }) => ({
    subject: `Application Status Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Application Status Update</h2>
        <p>Dear ${candidateName},</p>
        <p>Your application for the position of <strong>${jobTitle}</strong> has been updated.</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Current Status:</strong> ${status}</p>
        </div>
        <p>We will keep you informed of any further updates.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: `Dear ${candidateName},\n\nYour application for ${jobTitle} has been updated.\nCurrent Status: ${status}\n\nBest regards,\nHR Team`,
  }),
};

export default { sendEmail, emailTemplates };
