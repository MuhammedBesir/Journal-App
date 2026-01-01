import express from "express";
import { body } from "express-validator";
import {
  createEntry,
  getEntries,
  getEntryById,
  getEntryByDate,
  updateEntry,
  deleteEntry,
  getEntriesDates,
  getMoodStats,
} from "../controllers/journalController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Create entry
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("mood").optional().trim(),
    body("tags").optional().isArray(),
  ],
  createEntry
);

// Get all entries with filters
router.get("/", getEntries);

// Get dates with entries (for calendar)
router.get("/dates", getEntriesDates);

// Get mood statistics
router.get("/stats/mood", getMoodStats);

// Get entry by date
router.get("/date/:date", getEntryByDate);

// Get entry by ID
router.get("/:id", getEntryById);

// Update entry
router.put(
  "/:id",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("mood").optional().trim(),
    body("tags").optional().isArray(),
  ],
  updateEntry
);

// Delete entry
router.delete("/:id", deleteEntry);

export default router;
