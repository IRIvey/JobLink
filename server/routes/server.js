import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js"; // NEW
import jobRoutes from "./routes/jobRoutes.js"; // NEW
import applicationRoutes from "./routes/applicationRoutes.js"; // NEW

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
app.use("/api/jobseeker", jobSeekerRoutes); // NEW
app.use("/api/jobs", jobRoutes); // NEW
app.use("/api/applications", applicationRoutes); // NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));