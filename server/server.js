import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
//import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
//import applicationRoutes from "./routes/applicationRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import profileRoutes from "./routes/jobSeekerProfileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/Analyticsroutes.js";
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

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
//app.use("/api/jobseeker", jobSeekerRoutes);
app.use('/api/jobseeker/profile', profileRoutes);
app.use("/api/jobs", jobRoutes);
//app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));