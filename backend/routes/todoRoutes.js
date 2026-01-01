import express from "express";
import pool from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all todos for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    let query = "SELECT * FROM todos WHERE user_id = $1";
    const params = [req.user.id];

    if (date) {
      query += " AND date = $2";
      params.push(date);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json({ todos: result.rows });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Create a new todo
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, date, completed = false } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }

    const result = await pool.query(
      "INSERT INTO todos (user_id, title, date, completed) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, title, date, completed]
    );

    res.status(201).json({ todo: result.rows[0] });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update a todo
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, date } = req.body;

    const result = await pool.query(
      "UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed), date = COALESCE($3, date) WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, completed, date, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ todo: result.rows[0] });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete a todo
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
