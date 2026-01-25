import Message from "../models/Message.js";
import JobSeeker from "../models/JobSeeker.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { companyId, subject, message, applicationId } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.userType;

    // Validate required fields
    if (!companyId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Company ID, subject, and message are required"
      });
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    // If applicationId provided, verify it exists and belongs to the user
    if (applicationId) {
      const application = await Application.findOne({
        _id: applicationId,
        jobSeeker: senderId  // ✅ FIXED: Changed from 'applicant' to 'jobSeeker'
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found or you don't have permission"
        });
      }
    }

    // Create message
    const newMessage = await Message.create({
      sender: senderId,
      senderModel: senderType === 'jobseeker' ? 'JobSeeker' : 'Company',
      recipient: companyId,
      recipientModel: 'Company',
      application: applicationId || null,
      subject,
      message
    });

    // Populate sender and recipient details
    await newMessage.populate([
      { path: 'sender', select: 'fullName email' },
      { path: 'recipient', select: 'companyName email' }
    ]);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
};

// Get inbox messages (received messages)
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'fullName email companyName')
      .populate('application');

    const count = await Message.countDocuments({ recipient: userId });

    res.status(200).json({
      success: true,
      data: messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    console.error("Get inbox error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message
    });
  }
};

// Get sent messages
export const getSentMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ sender: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recipient', 'fullName email companyName')
      .populate('application');

    const count = await Message.countDocuments({ sender: userId });

    res.status(200).json({
      success: true,
      data: messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    console.error("Get sent messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sent messages",
      error: error.message
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      recipient: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message marked as read"
    });

  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error: error.message
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      recipient: userId,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });

  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      $or: [{ sender: userId }, { recipient: userId }]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have permission"
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message
    });
  }
};
