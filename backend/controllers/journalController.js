import { validationResult } from "express-validator";
import pool from "../config/database.js";

export const createEntry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, date, mood, tags } = req.body;
  const userId = req.user.id;

  try {
    // Check if entry for this date already exists
    const existingEntry = await pool.query(
      "SELECT id FROM journal_entries WHERE user_id = $1 AND date = $2",
      [userId, date]
    );

    if (existingEntry.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Entry for this date already exists" });
    }

    const result = await pool.query(
      "INSERT INTO journal_entries (user_id, title, content, date, mood, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, title, content, date, mood, tags || []]
    );

    res.status(201).json({
      message: "Entry created successfully",
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Create entry error:", error);
    res.status(500).json({ error: "Server error while creating entry" });
  }
};

export const getEntries = async (req, res) => {
  const userId = req.user.id;
  const {
    search,
    mood,
    tags,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = req.query;

  try {
    let query = "SELECT * FROM journal_entries WHERE user_id = $1";
    const params = [userId];
    let paramCount = 1;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add mood filter
    if (mood) {
      paramCount++;
      query += ` AND mood = $${paramCount}`;
      params.push(mood);
    }

    // Add tags filter
    if (tags) {
      const tagsArray = tags.split(",");
      paramCount++;
      query += ` AND tags && $${paramCount}`;
      params.push(tagsArray);
    }

    // Add date range filter
    if (startDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    // Order by date descending
    query += " ORDER BY date DESC";

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM journal_entries WHERE user_id = $1";
    const countParams = [userId];
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      entries: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Get entries error:", error);
    res.status(500).json({ error: "Server error while fetching entries" });
  }
};

export const getEntryById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error("Get entry error:", error);
    res.status(500).json({ error: "Server error while fetching entry" });
  }
};

export const getEntryByDate = async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM journal_entries WHERE date = $1 AND user_id = $2",
      [date, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No entry found for this date" });
    }

    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error("Get entry by date error:", error);
    res.status(500).json({ error: "Server error while fetching entry" });
  }
};

export const updateEntry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, content, date, mood, tags } = req.body;
  const userId = req.user.id;

  try {
    // Check if entry exists and belongs to user
    const existingEntry = await pool.query(
      "SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingEntry.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const result = await pool.query(
      "UPDATE journal_entries SET title = $1, content = $2, date = $3, mood = $4, tags = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *",
      [title, content, date, mood, tags || [], id, userId]
    );

    res.json({
      message: "Entry updated successfully",
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Update entry error:", error);
    res.status(500).json({ error: "Server error while updating entry" });
  }
};

export const deleteEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Delete entry error:", error);
    res.status(500).json({ error: "Server error while deleting entry" });
  }
};

export const getEntriesDates = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  try {
    let query = "SELECT date FROM journal_entries WHERE user_id = $1";
    const params = [userId];
    let paramCount = 1;

    if (year && month) {
      paramCount++;
      query += ` AND EXTRACT(YEAR FROM date) = $${paramCount}`;
      params.push(year);

      paramCount++;
      query += ` AND EXTRACT(MONTH FROM date) = $${paramCount}`;
      params.push(month);
    }

    query += " ORDER BY date";

    const result = await pool.query(query, params);
    const dates = result.rows.map((row) => row.date);

    res.json({ dates });
  } catch (error) {
    console.error("Get entries dates error:", error);
    res.status(500).json({ error: "Server error while fetching dates" });
  }
};

export const getMoodStats = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  try {
    let query = `
      SELECT mood, COUNT(*) as count 
      FROM journal_entries 
      WHERE user_id = $1 AND mood IS NOT NULL
    `;
    const params = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    query += " GROUP BY mood ORDER BY count DESC";

    const result = await pool.query(query, params);

    res.json({ moodStats: result.rows });
  } catch (error) {
    console.error("Get mood stats error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching mood statistics" });
  }
};
