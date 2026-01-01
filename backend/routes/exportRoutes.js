import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  exportAsMarkdown,
  exportAsJson,
  exportAsText
} from "../controllers/exportController.js";

const router = express.Router();

// All export routes require authentication
router.use(authenticateToken);

// GET /api/export/markdown - Export as Markdown file
router.get("/markdown", exportAsMarkdown);

// GET /api/export/json - Export as JSON backup
router.get("/json", exportAsJson);

// GET /api/export/text - Get data for PDF generation
router.get("/text", exportAsText);

export default router;
