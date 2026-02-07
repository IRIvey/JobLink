import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import JobSeeker from "../models/JobSeeker.js";
import mongoose from "mongoose";

// Get comprehensive analytics overview
export const getAnalyticsOverview = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { timeRange = "7d" } = req.query;

    // Calculate date range
    const dateRanges = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };
    const daysAgo = dateRanges[timeRange] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Parallel data fetching for better performance
    const [
      totalApplications,
      applicationsByStatus,
      applicationTrends,
      topPerformingJobs,
      candidateMetrics,
      responseMetrics,
    ] = await Promise.all([
      // Total applications count
      Application.countDocuments({ company: companyId }),

      // Applications by status
      Application.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    