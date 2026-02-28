/**
 * jobSeekerSearchController.js
 *
 * Two endpoints for the JobSeekerSearchOverlay:
 *   GET /api/jobseeker/search/saved?q=<term>
 *   GET /api/jobseeker/search/applications?q=<term>
 *
 * The full-text job search (GET /api/jobseeker/jobs/search) already exists
 * in your searchJobs controller — the overlay calls it directly.
 *
 * Register in your jobseeker router:
 *   import { searchSavedJobs, searchApplications } from "../controllers/jobSeekerSearchController.js";
 *   router.get("/search/saved",        protect, authorizeJobSeeker, searchSavedJobs);
 *   router.get("/search/applications", protect, authorizeJobSeeker, searchApplications);
 */

import JobSeeker from "../models/JobSeeker.js";    // adjust path if needed
import Application from "../models/Application.js"; // adjust path if needed
import Job from "../models/Job.js";                 // adjust path if needed

// ─── helpers ────────────────────────────────────────────────────────────────

const DEBUG = true; // set to false in production

const log = (...args) => {
  if (DEBUG) console.log("[JobSeekerSearch]", ...args);
};

const buildRegex = (term) => new RegExp(term.trim(), "i");

// ─── 1. Search Saved Jobs ────────────────────────────────────────────────────
/**
 * GET /api/jobseeker/search/saved?q=<term>
 *
 * Searches jobs the seeker has bookmarked by:
 *   - job title, location, type, skills, company name
 */
export const searchSavedJobs = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const seekerId = req.user._id || req.user.id;

    log(`searchSavedJobs | seeker=${seekerId} | q="${q}"`);

    if (!q || q.length < 2) {
      log("searchSavedJobs | query too short, returning empty");
      return res.status(200).json({ savedJobs: [] });
    }

    // 1) Fetch the seeker's savedJobs array (array of Job ObjectIds)
    const seeker = await JobSeeker.findById(seekerId).select("savedJobs").lean();

    if (!seeker) {
      log("searchSavedJobs | seeker not found");
      return res.status(404).json({ message: "Seeker not found" });
    }

    log(`searchSavedJobs | total saved jobs on seeker: ${seeker.savedJobs?.length ?? 0}`);

    if (!seeker.savedJobs || seeker.savedJobs.length === 0) {
      return res.status(200).json({ savedJobs: [] });
    }

    // 2) Search among those jobs using regex
    const regex = buildRegex(q);

    const savedJobs = await Job.find({
      _id: { $in: seeker.savedJobs },
      $or: [
        { title: regex },
        { location: regex },
        { type: regex },
        { skills: regex },
        { description: regex },
      ],
    })
      .populate("company", "companyName location profilePhoto")
      .select("title location type salary skills experience postedDate company")
      .limit(10)
      .lean();

    log(`searchSavedJobs | matched: ${savedJobs.length}`);

    // Debug: log titles matched
    if (DEBUG && savedJobs.length > 0) {
      log("searchSavedJobs | matches:", savedJobs.map((j) => j.title));
    }

    return res.status(200).json({ savedJobs });
  } catch (err) {
    console.error("[JobSeekerSearch] searchSavedJobs ERROR:", err);
    return res.status(500).json({
      message: "Server error in searchSavedJobs",
      ...(DEBUG && { error: err.message, stack: err.stack }),
    });
  }
};

// ─── 2. Search Applications ──────────────────────────────────────────────────
/**
 * GET /api/jobseeker/search/applications?q=<term>
 *
 * Searches the seeker's own applications by:
 *   - job title, company name, application status
 */
export const searchApplications = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const seekerId = req.user._id || req.user.id;

    log(`searchApplications | seeker=${seekerId} | q="${q}"`);

    if (!q || q.length < 2) {
      log("searchApplications | query too short, returning empty");
      return res.status(200).json({ applications: [] });
    }

    const regex = buildRegex(q);

    // Fetch all applications for this seeker, populated with job+company
    // Then filter in JS — avoids complex $lookup $match chains
    const allApps = await Application.find({ jobSeeker: seekerId })
      .populate({
        path: "job",
        select: "title location type salary company",
        populate: { path: "company", select: "companyName profilePhoto" },
      })
      .select("status appliedDate jobTitle companyName job")
      .lean();

    log(`searchApplications | total applications fetched: ${allApps.length}`);

    // Filter: match against job title, company name, or status
    const matched = allApps.filter((app) => {
      const jobTitle   = app.jobTitle   || app.job?.title                  || "";
      const company    = app.companyName || app.job?.company?.companyName  || "";
      const status     = app.status || "";

      const hit = [jobTitle, company, status].some((f) => regex.test(f));

      if (DEBUG && hit) {
        log(`searchApplications | hit: jobTitle="${jobTitle}" company="${company}" status="${status}"`);
      }

      return hit;
    });

    log(`searchApplications | matched: ${matched.length}`);

    // Normalise shape so frontend is consistent
    const applications = matched.slice(0, 10).map((app) => ({
      _id:         app._id,
      status:      app.status,
      appliedDate: app.appliedDate,
      jobTitle:    app.jobTitle    || app.job?.title                 || "Unknown Role",
      companyName: app.companyName || app.job?.company?.companyName  || "",
      job:         app.job,
    }));

    return res.status(200).json({ applications });
  } catch (err) {
    console.error("[JobSeekerSearch] searchApplications ERROR:", err);
    return res.status(500).json({
      message: "Server error in searchApplications",
      ...(DEBUG && { error: err.message, stack: err.stack }),
    });
  }
};
