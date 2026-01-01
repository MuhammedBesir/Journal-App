import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getTemplates,
  getTemplateById,
  getQuoteOfTheDay,
  getAllQuotes
} from "../controllers/templatesController.js";
import {
  getUserBadges,
  checkAndAwardBadges,
  getBadgeDefinitions
} from "../controllers/badgesController.js";

const router = express.Router();

// Template routes (public)
router.get("/templates", getTemplates);
router.get("/templates/:id", getTemplateById);

// Quote routes (public)
router.get("/quote", getQuoteOfTheDay);
router.get("/quotes", getAllQuotes);

// Badge routes (require auth)
router.get("/badges", authenticateToken, getUserBadges);
router.get("/badges/definitions", getBadgeDefinitions);
router.post("/badges/check", authenticateToken, checkAndAwardBadges);

export default router;
