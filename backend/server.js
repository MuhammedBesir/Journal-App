import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "./config/initDb.js";
import authRoutes from "./routes/authRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import featuresRoutes from "./routes/featuresRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://journal-app-two-xi.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/features", featuresRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/media", mediaRoutes);

// Import buddy routes
import buddyRoutes from "./routes/buddyRoutes.js";
app.use("/api/buddies", buddyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Debug DB - Temporary
import pool from "./config/database.js";
app.get("/api/db-check", async (req, res) => {
  try {
    const client = await pool.connect();
    const nowResult = await client.query("SELECT NOW()");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    client.release();
    
    res.json({ 
      status: "connected", 
      time: nowResult.rows[0].now,
      tables: tablesResult.rows.map(r => r.table_name),
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error("DB Check Failed:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      connectionString: process.env.DATABASE_URL ? "Exists" : "Missing"
    });
  }
});

// Advanced Debug: Test Query on 'users'
app.get("/api/debug-users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email FROM users LIMIT 5");
    res.json({ 
      status: "success", 
      count: result.rows.length,
      users: result.rows 
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Advanced Debug: Test Token Decoding (Mock)
import jwt from "jsonwebtoken";
app.get("/api/debug-token", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.json({ status: "no-token" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ status: "valid", decoded });
  } catch (err) {
    res.json({ status: "invalid", error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Return actual error for debugging
  res.status(500).json({ 
    error: err.message,
    details: err.stack,
    path: req.path
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    // For Vercel, we export the app
    // Only listen if not running in Vercel (or similar serverless env)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Export for Vercel serverless
export default app;
