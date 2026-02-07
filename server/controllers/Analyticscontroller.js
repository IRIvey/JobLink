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
    
      // Application trends over time
      Application.aggregate([
        {
          $match: {
            company: new mongoose.Types.ObjectId(companyId),
            appliedDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$appliedDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

           // Top performing jobs by application count
      Application.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: "$job",
            applicationCount: { $sum: 1 },
            acceptedCount: {
              $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
            },
            interviewCount: {
              $sum: { $cond: [{ $eq: ["$status", "interview"] }, 1, 0] },
            },
          },
        },
        { $sort: { applicationCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "jobs",
            localField: "_id",
            foreignField: "_id",
            as: "jobDetails",
          },
        },
        { $unwind: "$jobDetails" },
      ]),