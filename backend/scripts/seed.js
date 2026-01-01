import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
  const client = await pool.connect();

  try {
    console.log("Starting database seed...");

    // Create test users
    const passwordHash = await bcrypt.hash("password123", 10);

    const user1 = await client.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ["John Doe", "john@example.com", passwordHash]
    );

    const user2 = await client.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ["Jane Smith", "jane@example.com", passwordHash]
    );

    const userId = user1.rows.length > 0 ? user1.rows[0].id : 1;

    // Create sample journal entries
    const entries = [
      {
        title: "First Day of the Year",
        content:
          "Today marks the beginning of a new year. I feel hopeful and excited about the possibilities ahead. I've set some goals for myself and I'm ready to work towards them.",
        date: "2026-01-01",
        mood: "Happy",
        tags: ["new year", "goals", "optimistic"],
      },
      {
        title: "Productive Monday",
        content:
          "Had a very productive day at work. Completed two major tasks and felt really accomplished. Evening was spent reading a good book.",
        date: "2025-12-30",
        mood: "Accomplished",
        tags: ["work", "productivity", "reading"],
      },
      {
        title: "Weekend Reflections",
        content:
          "Spent the weekend with family. It was nice to disconnect from work and just enjoy quality time with loved ones. We went for a hike and had a lovely dinner.",
        date: "2025-12-28",
        mood: "Grateful",
        tags: ["family", "weekend", "nature"],
      },
      {
        title: "Challenging Day",
        content:
          "Today was tough. Faced some challenges at work that made me question my abilities. But I know this is just a temporary setback.",
        date: "2025-12-25",
        mood: "Anxious",
        tags: ["work", "challenges", "growth"],
      },
      {
        title: "Creative Breakthrough",
        content:
          "Finally had a breakthrough on the project I've been working on! The solution came to me during my morning walk. Feeling inspired and energized.",
        date: "2025-12-20",
        mood: "Excited",
        tags: ["work", "creativity", "inspiration"],
      },
    ];

    for (const entry of entries) {
      await client.query(
        `INSERT INTO journal_entries (user_id, title, content, date, mood, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, date) DO NOTHING`,
        [userId, entry.title, entry.content, entry.date, entry.mood, entry.tags]
      );
    }

    console.log("Seed data inserted successfully!");
    console.log("\nTest accounts:");
    console.log("Email: john@example.com | Password: password123");
    console.log("Email: jane@example.com | Password: password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
