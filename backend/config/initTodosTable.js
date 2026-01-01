const pool = require("./database");

const createTodosTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Todos table created successfully");
  } catch (error) {
    console.error("Error creating todos table:", error);
    throw error;
  }
};

module.exports = createTodosTable;
