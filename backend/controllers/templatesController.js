import pool from "../config/database.js";

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM templates ORDER BY is_default DESC, name`
    );
    res.json({ templates: result.rows });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Server error while fetching templates" });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM templates WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ error: "Server error while fetching template" });
  }
};

// Get motivational quote of the day
export const getQuoteOfTheDay = async (req, res) => {
  try {
    // Use day of year to get consistent quote per day
    const result = await pool.query(
      `SELECT * FROM motivational_quotes 
       ORDER BY id 
       OFFSET (EXTRACT(DOY FROM CURRENT_DATE)::INT % (SELECT COUNT(*) FROM motivational_quotes))
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({ 
        quote: { 
          quote: "Every day is a chance to begin again.", 
          quote_tr: "Her gün yeni bir başlangıç şansıdır.",
          author: "Unknown" 
        } 
      });
    }

    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({ error: "Server error while fetching quote" });
  }
};

// Get all quotes
export const getAllQuotes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM motivational_quotes ORDER BY id`
    );
    res.json({ quotes: result.rows });
  } catch (error) {
    console.error("Get quotes error:", error);
    res.status(500).json({ error: "Server error while fetching quotes" });
  }
};
