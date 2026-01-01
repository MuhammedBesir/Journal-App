import pool from "../config/database.js";

// Get user's buddies
export const getBuddies = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT b.*, 
        u.name as buddy_name, 
        u.email as buddy_email,
        (SELECT COUNT(*) FROM journal_entries WHERE user_id = b.buddy_id AND date >= CURRENT_DATE - INTERVAL '7 days') as entries_this_week
       FROM buddies b
       JOIN users u ON b.buddy_id = u.id
       WHERE b.user_id = $1 AND b.status = 'accepted'
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json({ buddies: result.rows });
  } catch (error) {
    console.error("Get buddies error:", error);
    res.status(500).json({ error: "Failed to get buddies" });
  }
};

// Get pending buddy requests
export const getPendingRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT b.*, u.name as requester_name, u.email as requester_email
       FROM buddies b
       JOIN users u ON b.user_id = u.id
       WHERE b.buddy_id = $1 AND b.status = 'pending'
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ error: "Failed to get pending requests" });
  }
};

// Send buddy request
export const sendBuddyRequest = async (req, res) => {
  const userId = req.user.id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find buddy by email
    const buddyResult = await pool.query(
      `SELECT id, name FROM users WHERE email = $1`,
      [email]
    );

    if (buddyResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const buddyId = buddyResult.rows[0].id;

    if (buddyId === userId) {
      return res.status(400).json({ error: "Cannot add yourself as a buddy" });
    }

    // Check if request already exists
    const existing = await pool.query(
      `SELECT id FROM buddies WHERE user_id = $1 AND buddy_id = $2`,
      [userId, buddyId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Buddy request already sent" });
    }

    // Create buddy request
    await pool.query(
      `INSERT INTO buddies (user_id, buddy_id, status) VALUES ($1, $2, 'pending')`,
      [userId, buddyId]
    );

    res.json({ 
      message: "Buddy request sent",
      buddy: { name: buddyResult.rows[0].name }
    });
  } catch (error) {
    console.error("Send buddy request error:", error);
    res.status(500).json({ error: "Failed to send buddy request" });
  }
};

// Accept buddy request
export const acceptBuddyRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.params;

  try {
    // Update status to accepted
    const result = await pool.query(
      `UPDATE buddies SET status = 'accepted' 
       WHERE id = $1 AND buddy_id = $2 AND status = 'pending'
       RETURNING *`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Create reverse buddy relationship
    const request = result.rows[0];
    await pool.query(
      `INSERT INTO buddies (user_id, buddy_id, status) 
       VALUES ($1, $2, 'accepted')
       ON CONFLICT DO NOTHING`,
      [userId, request.user_id]
    );

    res.json({ message: "Buddy request accepted" });
  } catch (error) {
    console.error("Accept buddy request error:", error);
    res.status(500).json({ error: "Failed to accept request" });
  }
};

// Decline buddy request
export const declineBuddyRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM buddies WHERE id = $1 AND buddy_id = $2 AND status = 'pending'
       RETURNING *`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ message: "Buddy request declined" });
  } catch (error) {
    console.error("Decline buddy request error:", error);
    res.status(500).json({ error: "Failed to decline request" });
  }
};

// Remove buddy
export const removeBuddy = async (req, res) => {
  const userId = req.user.id;
  const { buddyId } = req.params;

  try {
    // Remove both directions of the buddy relationship
    await pool.query(
      `DELETE FROM buddies WHERE (user_id = $1 AND buddy_id = $2) OR (user_id = $2 AND buddy_id = $1)`,
      [userId, buddyId]
    );

    res.json({ message: "Buddy removed" });
  } catch (error) {
    console.error("Remove buddy error:", error);
    res.status(500).json({ error: "Failed to remove buddy" });
  }
};
