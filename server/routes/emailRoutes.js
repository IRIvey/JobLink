import express from "express";
import { sendCustomEmail, sendBulkEmails } from "../controllers/emailController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/send", sendCustomEmail);
router.post("/bulk", sendBulkEmails);

export default router;