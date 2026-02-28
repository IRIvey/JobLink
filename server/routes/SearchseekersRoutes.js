import express from "express";
import JobSeeker from "../models/JobSeeker.js"; // adjust path if needed

const router = express.Router();

// GET /api/searchseekers?q=<term>
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q || q.length < 2) {
      return res.status(200).json({ seekers: [] });
    }

    const regex = new RegExp(q, "i");

    const seekers = await JobSeeker.find({
      $or: [
        { fullName: regex },
        { email: regex },
        { location: regex },
        { bio: regex },
        { skills: regex },
        { "resume.personalInfo.fullName": regex },
      ],
    })
      .select("fullName email location bio skills profilePhoto")
      .limit(10)
      .lean();

    return res.status(200).json({ seekers });
  } catch (err) {
    console.error("searchSeekers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
