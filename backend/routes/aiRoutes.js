import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  analyzeMood,
  getWritingSuggestions,
  getWeeklySummary,
  getInsights
} from "../controllers/aiController.js";

const router = express.Router();

// All AI routes require authentication
router.use(authenticateToken);

// POST /api/ai/analyze-mood - Analyze mood from journal content
router.post("/analyze-mood", analyzeMood);

// GET /api/ai/suggestions - Get personalized writing suggestions
router.get("/suggestions", getWritingSuggestions);

// GET /api/ai/weekly-summary - Get AI-generated weekly summary
router.get("/weekly-summary", getWeeklySummary);

// GET /api/ai/insights - Get personalized insights based on patterns
router.get("/insights", getInsights);

export default router;
