import express from "express";
import { sendCustomEmail, sendBulkEmails } from "../controllers/emailController.js";
import { protect, authorizeCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and company authorization
router.use(protect);
router.use(authorizeCompany);

// Send custom email
router.post("/send", sendCustomEmail);

// Send bulk emails
router.post("/bulk", sendBulkEmails);

export default router;