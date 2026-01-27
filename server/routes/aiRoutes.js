import express from "express";
import { geminiChat } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/gemini
router.post("/gemini", geminiChat);

export default router;
