import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middleware/auth.js";
import pool from "../config/database.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "audio/mpeg", "audio/wav", "audio/webm"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload media file
router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { entryId } = req.body;
    const userId = req.user.id;
    const mediaType = req.file.mimetype.startsWith("image/") ? "image" : "audio";

    // Save to database
    const result = await pool.query(
      `INSERT INTO entry_media (entry_id, user_id, media_type, file_path, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [entryId || null, userId, mediaType, req.file.filename, req.file.originalname, req.file.size]
    );

    res.json({
      message: "File uploaded successfully",
      media: result.rows[0],
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Get media for an entry
router.get("/entry/:entryId", authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM entry_media WHERE entry_id = $1 AND user_id = $2`,
      [entryId, userId]
    );

    res.json({ media: result.rows });
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ error: "Failed to get media" });
  }
});

// Delete media
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get file info first
    const result = await pool.query(
      `SELECT * FROM entry_media WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const media = result.rows[0];

    // Delete file from disk
    const filePath = path.join(__dirname, "../uploads", media.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query(`DELETE FROM entry_media WHERE id = $1`, [id]);

    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
