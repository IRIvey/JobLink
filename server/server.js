import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
//import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import profileRoutes from "./routes/jobSeekerProfileRoutes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("JobLink API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
//app.use("/api/jobseeker", jobSeekerRoutes);
app.use('/api/jobseeker/profile', profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);




const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));