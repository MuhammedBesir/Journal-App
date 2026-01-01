import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getStreak,
  getWordCloud,
  getWritingFrequency,
  getMoodTrends,
  getAnalyticsSummary
} from "../controllers/analyticsController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/analytics/streak - Get current and longest streak
router.get("/streak", getStreak);

// GET /api/analytics/word-cloud - Get word frequency for word cloud
router.get("/word-cloud", getWordCloud);

// GET /api/analytics/writing-frequency - Get writing frequency by day of week
router.get("/writing-frequency", getWritingFrequency);

// GET /api/analytics/mood-trends - Get mood trends over time
router.get("/mood-trends", getMoodTrends);

// GET /api/analytics/summary - Get overall analytics summary
router.get("/summary", getAnalyticsSummary);

export default router;
