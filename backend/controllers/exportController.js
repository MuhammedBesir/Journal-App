import pool from "../config/database.js";

// Export entries as Markdown
export const exportAsMarkdown = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  try {
    let query = `SELECT * FROM journal_entries WHERE user_id = $1`;
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

    query += ` ORDER BY date DESC`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No entries found" });
    }

    // Generate Markdown content
    let markdown = `# My Journal\n\n`;
    markdown += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;
    markdown += `---\n\n`;

    const moodEmojis = {
      'Happy': '😊',
      'Sad': '😢',
      'Neutral': '😐',
      'Energetic': '⚡',
      'Calm': '😌'
    };

    result.rows.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      markdown += `## ${entry.title}\n\n`;
      markdown += `📅 **Date:** ${date}\n\n`;
      
      if (entry.mood) {
        markdown += `${moodEmojis[entry.mood] || '😐'} **Mood:** ${entry.mood}\n\n`;
      }

      if (entry.tags && entry.tags.length > 0) {
        markdown += `🏷️ **Tags:** ${entry.tags.map(t => `#${t}`).join(' ')}\n\n`;
      }

      markdown += `${entry.content}\n\n`;
      markdown += `---\n\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="journal-export-${new Date().toISOString().split('T')[0]}.md"`);
    
    res.send(markdown);
  } catch (error) {
    console.error("Export markdown error:", error);
    res.status(500).json({ error: "Server error while exporting" });
  }
};

// Export entries as JSON (for backup)
export const exportAsJson = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC`,
      [userId]
    );

    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: result.rows.length,
      entries: result.rows.map(entry => ({
        title: entry.title,
        content: entry.content,
        date: entry.date,
        mood: entry.mood,
        tags: entry.tags,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="journal-backup-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error("Export JSON error:", error);
    res.status(500).json({ error: "Server error while exporting" });
  }
};

// Export entries as simple text (for PDF generation on frontend)
export const exportAsText = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  try {
    let query = `SELECT * FROM journal_entries WHERE user_id = $1`;
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

    query += ` ORDER BY date DESC`;

    const result = await pool.query(query, params);

    // Return structured data for frontend PDF generation
    res.json({
      exportDate: new Date().toISOString(),
      totalEntries: result.rows.length,
      entries: result.rows
    });
  } catch (error) {
    console.error("Export text error:", error);
    res.status(500).json({ error: "Server error while exporting" });
  }
};
