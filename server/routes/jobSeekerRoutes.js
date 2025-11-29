import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


router.put("/profile", protect, authorizeRoles("jobseeker"), async (req, res) => {
  try {
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;