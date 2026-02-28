import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import profileRoutes from "./routes/jobSeekerProfileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/Analyticsroutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import jobseekersearchroutes from "./routes/Jobseekersearchroutes.js";
// ✅ NEW ROUTES - Import notification, interview, and email routes
import interviewRoutes from "./routes/interviewRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import SearchseekersRoutes from "./routes/SearchseekersRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("JobLink API Running");
});

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/jobseeker/profile', profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/searchseekers", SearchseekersRoutes);
app.use("/api/jobseeker/search", jobseekersearchroutes);
// ✅ NEW ROUTES - Add notification, interview, and email routes
app.use("/api/interviews", interviewRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", analyzeRoutes);
// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;