import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js"; // NEW
import jobRoutes from "./routes/jobRoutes.js"; // NEW
import applicationRoutes from "./routes/applicationRoutes.js"; // NEW
import resumeRoutes from "./routes/resumeRoutes.js";


<<<<<<< HEAD
import resumeRoutes from "./routes/resumeRoutes.js";
=======
import companyRoutes from "./routes/companyRoutes.js"; 
>>>>>>> f3b7fea2c22f0fc824ea4aa461ce831bf2e8ed1b

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
app.use("/api/jobseeker", jobSeekerRoutes); // NEW
app.use("/api/jobs", jobRoutes); // NEW
app.use("/api/applications", applicationRoutes); // NEW
<<<<<<< HEAD
app.use("/api/resume", resumeRoutes); 
=======
app.use("/api/companies", companyRoutes);
>>>>>>> f3b7fea2c22f0fc824ea4aa461ce831bf2e8ed1b

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));