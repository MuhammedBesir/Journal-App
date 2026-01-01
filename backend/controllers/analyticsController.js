import pool from "../config/database.js";

// Get real streak calculation
export const getStreak = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get all entry dates for the user, ordered by date descending
    const result = await pool.query(
      `SELECT DISTINCT date 
       FROM journal_entries 
       WHERE user_id = $1 
       ORDER BY date DESC`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        currentStreak: 0, 
        longestStreak: 0,
        totalEntries: 0,
        lastEntryDate: null
      });
    }

    const dates = result.rows.map(row => new Date(row.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check if there's an entry today or yesterday
    const latestEntryDate = new Date(dates[0]);
    latestEntryDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - latestEntryDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      // Streak is broken - no entry today or yesterday
      currentStreak = 0;
    } else {
      // Start counting from the most recent entry
      checkDate = new Date(latestEntryDate);
      
      for (let i = 0; i < dates.length; i++) {
        const entryDate = new Date(dates[i]);
        entryDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    res.json({
      currentStreak,
      longestStreak,
      totalEntries: dates.length,
      lastEntryDate: dates[0]
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ error: "Server error while calculating streak" });
  }
};

// Get word cloud data
export const getWordCloud = async (req, res) => {
  const userId = req.user.id;
  const { limit = 50 } = req.query;

  try {
    // Get all content from user's entries
    const result = await pool.query(
      `SELECT content, title FROM journal_entries WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ words: [] });
    }

    // Combine all text
    const allText = result.rows
      .map(row => `${row.title} ${row.content}`)
      .join(" ")
      .toLowerCase();

    // Common stop words to exclude (English + Turkish)
    const stopWords = new Set([
      // English
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'she', 'it',
      'they', 'them', 'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very',
      'just', 'also', 'now', 'here', 'there', 'then', 'if', 'because', 'as', 'until', 'while',
      'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
      'out', 'off', 'over', 'under', 'again', 'further', 'once', 'am', 'can', 'get', 'got',
      // Turkish
      've', 'veya', 'ama', 'fakat', 'ile', 'için', 'de', 'da', 'den', 'dan', 'ki', 'ne',
      'bu', 'şu', 'o', 'ben', 'sen', 'biz', 'siz', 'onlar', 'bir', 'iki', 'üç', 'dört',
      'gibi', 'kadar', 'daha', 'en', 'çok', 'az', 'var', 'yok', 'olarak', 'olan', 'oldu',
      'olacak', 'ise', 'ya', 'hem', 'mi', 'mı', 'mu', 'mü', 'değil', 'nasıl', 'neden',
      'nerede', 'ne', 'kim', 'hangi', 'her', 'hiç', 'bazı', 'bütün', 'tüm', 'diğer',
      'kendi', 'aynı', 'bile', 'sadece', 'yalnız', 'artık', 'hala', 'henüz', 'şimdi',
      'bugün', 'dün', 'yarın', 'gün', 'ay', 'yıl', 'zaman'
    ]);

    // Extract and count words
    const words = allText
      .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word));

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort and limit
    const sortedWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([text, value]) => ({ text, value }));

    res.json({ words: sortedWords });
  } catch (error) {
    console.error("Get word cloud error:", error);
    res.status(500).json({ error: "Server error while generating word cloud" });
  }
};

// Get writing frequency by day of week
export const getWritingFrequency = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
        EXTRACT(DOW FROM date) as day_of_week,
        COUNT(*) as count
       FROM journal_entries 
       WHERE user_id = $1 
       GROUP BY EXTRACT(DOW FROM date)
       ORDER BY day_of_week`,
      [userId]
    );

    // Create full week data (0 = Sunday, 6 = Saturday)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesTr = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    
    const frequencyData = dayNames.map((name, index) => {
      const found = result.rows.find(row => parseInt(row.day_of_week) === index);
      return {
        day: index,
        dayName: name,
        dayNameTr: dayNamesTr[index],
        count: found ? parseInt(found.count) : 0
      };
    });

    // Find most active day
    const mostActiveDay = frequencyData.reduce((max, current) => 
      current.count > max.count ? current : max
    , frequencyData[0]);

    res.json({ 
      frequency: frequencyData,
      mostActiveDay: mostActiveDay.dayName,
      mostActiveDayTr: mostActiveDay.dayNameTr
    });
  } catch (error) {
    console.error("Get writing frequency error:", error);
    res.status(500).json({ error: "Server error while fetching writing frequency" });
  }
};

// Get mood trends over time
export const getMoodTrends = async (req, res) => {
  const userId = req.user.id;
  const { period = 'month' } = req.query; // 'week', 'month', 'year'

  try {
    let dateFormat, groupBy;
    
    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD';
        groupBy = 'date';
        break;
      case 'year':
        dateFormat = 'YYYY-MM';
        groupBy = "TO_CHAR(date, 'YYYY-MM')";
        break;
      default: // month
        dateFormat = 'YYYY-MM-DD';
        groupBy = 'date';
    }

    const result = await pool.query(
      `SELECT 
        TO_CHAR(date, '${dateFormat}') as period,
        mood,
        COUNT(*) as count
       FROM journal_entries 
       WHERE user_id = $1 
         AND mood IS NOT NULL
         AND date >= CURRENT_DATE - INTERVAL '${period === 'year' ? '12 months' : period === 'month' ? '30 days' : '7 days'}'
       GROUP BY TO_CHAR(date, '${dateFormat}'), mood
       ORDER BY period`,
      [userId]
    );

    // Transform data for charting
    const moodScores = {
      'Happy': 5,
      'Energetic': 4,
      'Calm': 3,
      'Neutral': 2,
      'Sad': 1
    };

    // Group by period
    const periodData = {};
    result.rows.forEach(row => {
      if (!periodData[row.period]) {
        periodData[row.period] = { period: row.period, moods: {}, avgScore: 0 };
      }
      periodData[row.period].moods[row.mood] = parseInt(row.count);
    });

    // Calculate average mood score per period
    Object.values(periodData).forEach(data => {
      let totalScore = 0;
      let totalCount = 0;
      Object.entries(data.moods).forEach(([mood, count]) => {
        totalScore += (moodScores[mood] || 0) * count;
        totalCount += count;
      });
      data.avgScore = totalCount > 0 ? (totalScore / totalCount).toFixed(2) : 0;
    });

    res.json({ 
      trends: Object.values(periodData),
      moodScores 
    });
  } catch (error) {
    console.error("Get mood trends error:", error);
    res.status(500).json({ error: "Server error while fetching mood trends" });
  }
};

// Get comprehensive analytics summary
export const getAnalyticsSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get total entries and average word count
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_entries,
        COALESCE(AVG(LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1), 0) as avg_words
       FROM journal_entries 
       WHERE user_id = $1`,
      [userId]
    );

    // Get entries this month
    const monthResult = await pool.query(
      `SELECT COUNT(*) as monthly_entries
       FROM journal_entries 
       WHERE user_id = $1 
       AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );

    // Get entries this week
    const weekResult = await pool.query(
      `SELECT COUNT(*) as weekly_entries
       FROM journal_entries 
       WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    res.json({
      totalEntries: parseInt(statsResult.rows[0].total_entries),
      avgWordsPerEntry: Math.round(parseFloat(statsResult.rows[0].avg_words)),
      entriesThisMonth: parseInt(monthResult.rows[0].monthly_entries),
      entriesThisWeek: parseInt(weekResult.rows[0].weekly_entries)
    });
  } catch (error) {
    console.error("Get analytics summary error:", error);
    res.status(500).json({ error: "Server error while fetching analytics summary" });
  }
};
