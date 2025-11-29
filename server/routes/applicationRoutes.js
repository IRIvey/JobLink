import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's applications
router.get("/", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    const { status } = req.query;
    // Implementation here
    res.json({ applications: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;