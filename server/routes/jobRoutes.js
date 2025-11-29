import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/recommendations", protect, async (req, res) => {
  try {
    res.json({ jobs: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:id/save", protect, async (req, res) => {
  try {
    res.json({ message: "Job saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;