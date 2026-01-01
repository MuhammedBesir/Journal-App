import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/database.js";

// Lazy initialization of Gemini AI
let genAI = null;
const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Analyze mood from content using Gemini
export const analyzeMood = async (req, res) => {
  const { content, title } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: "Failed to initialize AI" });
    }
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze the emotional tone of this journal entry and determine the primary mood.
    
Title: ${title || "No title"}
Content: ${content}

Respond with ONLY ONE of these exact words (nothing else):
- Happy (if the content expresses joy, happiness, gratitude, excitement)
- Sad (if the content expresses sadness, grief, disappointment, melancholy)
- Neutral (if the content is factual, balanced, or has mixed emotions)
- Energetic (if the content shows high energy, motivation, productivity)
- Calm (if the content expresses peace, relaxation, contentment, mindfulness)

Your response must be exactly one word from the list above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let mood = response.text().trim();

    // Validate the response
    const validMoods = ["Happy", "Sad", "Neutral", "Energetic", "Calm"];
    if (!validMoods.includes(mood)) {
      // Try to extract a valid mood from the response
      mood = validMoods.find(m => response.text().includes(m)) || "Neutral";
    }

    res.json({ 
      mood, 
      confidence: "high",
      message: "Mood analyzed successfully" 
    });
  } catch (error) {
    console.error("Gemini AI mood analysis error:", error);
    res.status(500).json({ error: "Failed to analyze mood", fallback: "Neutral" });
  }
};

// Get writing suggestions based on user's writing patterns
export const getWritingSuggestions = async (req, res) => {
  const userId = req.user.id;
  const { language = 'en' } = req.query; // Get language from query

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    // Get user's recent entries for context
    const recentEntries = await pool.query(
      `SELECT title, content, mood, date FROM journal_entries 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 5`,
      [userId]
    );

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let context = "";
    if (recentEntries.rows.length > 0) {
      context = recentEntries.rows.map(e => 
        `Date: ${e.date}, Mood: ${e.mood || 'unknown'}, Title: ${e.title}`
      ).join("\n");
    }

    const promptLanguage = language === 'tr' ? 'Turkish' : 'English';
    const dbLanguage = language === 'tr' ? 'tr' : 'en';

    const prompt = `You are a thoughtful journaling assistant. Based on this user's recent journal activity, suggest 3 writing prompts for today.

${context ? `Recent entries:\n${context}` : "The user is new to journaling."}

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Provide exactly 3 short, thoughtful writing prompts in JSON format. Each prompt should be different in style (reflective, gratitude, growth-focused).
IMPORTANT: The 'title' 'prompt' and 'type' values MUST be in ${promptLanguage}.

Respond ONLY with valid JSON in this exact format:
{
  "prompts": [
    {"title": "Short title", "prompt": "The writing prompt question or suggestion", "type": "reflection"},
    {"title": "Short title", "prompt": "The writing prompt question or suggestion", "type": "gratitude"},
    {"title": "Short title", "prompt": "The writing prompt question or suggestion", "type": "growth"}
  ]
}`;

    // Set timeout for AI generation to prevent 504s
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI generation timed out")), 8000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      res.json(suggestions);
    } else {
      throw new Error("Invalid JSON format from AI");
    }
  } catch (error) {
    console.error("Gemini AI suggestions error:", error);
    
    // Fallback suggestions based on language
    const fallbacks = {
      en: [
        { title: "Daily Reflection", prompt: "What moment today brought you the most peace?", type: "reflection" },
        { title: "Gratitude", prompt: "Name three small things you're grateful for right now.", type: "gratitude" },
        { title: "Growth", prompt: "What's one thing you learned about yourself this week?", type: "growth" }
      ],
      tr: [
        { title: "Günlük Yansıma", prompt: "Bugün sana en çok huzur veren an hangisiydi?", type: "reflection" },
        { title: "Şükran", prompt: "Şu an minnettar olduğun üç küçük şeyi yaz.", type: "gratitude" },
        { title: "Gelişim", prompt: "Bu hafta kendin hakkında öğrendiğin bir şey nedir?", type: "growth" }
      ]
    };

    res.json({
      prompts: fallbacks[req.query.language === 'tr' ? 'tr' : 'en']
    });
  }
};

// Generate weekly summary using AI
export const getWeeklySummary = async (req, res) => {
  const userId = req.user.id;
  const { language = 'en' } = req.query;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    // Get entries from the last 7 days
    const entries = await pool.query(
      `SELECT title, content, mood, date FROM journal_entries 
       WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY date DESC`,
      [userId]
    );

    if (entries.rows.length === 0) {
      const msg = language === 'tr' 
        ? "Bu hafta hiç günlük girmedin. Kişiselleştirilmiş içgörüler için yazmaya başla!" 
        : "No entries this week. Start writing to get personalized insights!";
      return res.json({ 
        summary: msg,
        hasData: false 
      });
    }

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const entriesContext = entries.rows.map(e => 
      `Date: ${e.date}\nMood: ${e.mood || 'not specified'}\nTitle: ${e.title}\nContent: ${e.content.substring(0, 500)}...`
    ).join("\n\n---\n\n");

    const promptLanguage = language === 'tr' ? 'Turkish' : 'English';

    const prompt = `You are a compassionate journaling companion. Analyze this week's journal entries and provide a brief, supportive weekly summary.

Entries from this week:
${entriesContext}

Write a warm, personalized summary (150-200 words) that:
1. Highlights the emotional themes of the week
2. Notes any positive patterns or growth
3. Offers gentle encouragement for the coming week

Write in a supportive, personal tone as if you're their thoughtful friend.
IMPORTANT: Write the summary entirely in ${promptLanguage}.`;

    // Set timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI generation timed out")), 8000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const response = await result.response;
    const summary = response.text();

    // Calculate mood stats for the week
    const moodCounts = {};
    entries.rows.forEach(e => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
    });

    res.json({ 
      summary,
      hasData: true,
      entryCount: entries.rows.length,
      moodBreakdown: moodCounts,
      periodStart: entries.rows[entries.rows.length - 1]?.date,
      periodEnd: entries.rows[0]?.date
    });
  } catch (error) {
    console.error("Gemini AI weekly summary error:", error);
    const errorMsg = language === 'tr'
      ? "Özet oluşturulurken bir hata oluştu veya çok uzun sürdü."
      : "Failed to generate summary or request timed out.";
    res.status(500).json({ error: errorMsg });
  }
};

// Get personalized insights based on journal patterns
export const getInsights = async (req, res) => {
  const userId = req.user.id;
  const { language = 'en' } = req.query;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    // Get mood distribution
    const moodStats = await pool.query(
      `SELECT mood, COUNT(*) as count FROM journal_entries 
       WHERE user_id = $1 AND mood IS NOT NULL
       GROUP BY mood`,
      [userId]
    );

    // Get writing frequency
    const frequencyStats = await pool.query(
      `SELECT EXTRACT(DOW FROM date) as day, COUNT(*) as count 
       FROM journal_entries 
       WHERE user_id = $1 
       GROUP BY EXTRACT(DOW FROM date)`,
      [userId]
    );

    // Get total entries
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM journal_entries WHERE user_id = $1`,
      [userId]
    );

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const promptLanguage = language === 'tr' ? 'Turkish' : 'English';

    const prompt = `Analyze this journaling data and provide 3 personalized insights.

Mood distribution: ${JSON.stringify(moodStats.rows)}
Writing frequency by day (0=Sunday): ${JSON.stringify(frequencyStats.rows)}
Total entries: ${totalResult.rows[0].total}

Provide exactly 3 actionable insights in JSON format:
{
  "insights": [
    {"icon": "emoji", "title": "Short insight title", "text": "Brief insight explanation (1-2 sentences)"},
    {"icon": "emoji", "title": "Short insight title", "text": "Brief insight explanation"},
    {"icon": "emoji", "title": "Short insight title", "text": "Brief insight explanation"}
  ]
}

Use appropriate emojis for icons (like 🎯, 💪, 🌟, etc.)
IMPORTANT: The 'title' and 'text' values MUST be in ${promptLanguage}.`;

    // Set timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI generation timed out")), 8000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      res.json(insights);
    } else {
      throw new Error("Invalid JSON format from AI");
    }
  } catch (error) {
    console.error("Gemini AI insights error:", error);
    
    const fallbacks = {
      en: [
        { icon: "📝", title: "Keep Writing", text: "Consistency builds self-awareness over time." },
        { icon: "🌟", title: "Reflect Daily", text: "Even a few sentences can make a difference." },
        { icon: "💪", title: "You're Doing Great", text: "Every entry helps you grow." }
      ],
      tr: [
        { icon: "📝", title: "Yazmaya Devam Et", text: "Tutarlılık zamanla farkındalık oluşturur." },
        { icon: "🌟", title: "Günlük Yansıma", text: "Birkaç cümle bile fark yaratabilir." },
        { icon: "💪", title: "Harika Gidiyorsun", text: "Her günlük girişi seni geliştirir." }
      ]
    };

    res.json({
      insights: fallbacks[language === 'tr' ? 'tr' : 'en']
    });
  }
};
