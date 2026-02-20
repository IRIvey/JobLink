// routes/analyzeRoutes.js
import express from "express";
import { analyzeApplicants } from "../controllers/analyzeapplicantsController.js";


const router = express.Router();

router.post("/analyze-applicants", analyzeApplicants); // ✅ Add auth

export default router;
