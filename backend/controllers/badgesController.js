import pool from "../config/database.js";

// Badge definitions
const BADGE_DEFINITIONS = {
  first_entry: {
    name: 'First Entry',
    nameTr: 'İlk Giriş',
    description: 'Created your first journal entry',
    descriptionTr: 'İlk günlük girişini oluşturdun',
    icon: 'edit_note'
  },
  streak_7: {
    name: '7 Day Streak',
    nameTr: '7 Günlük Seri',
    description: 'Wrote for 7 consecutive days',
    descriptionTr: '7 gün üst üste yazdın',
    icon: 'local_fire_department'
  },
  streak_30: {
    name: '30 Day Streak',
    nameTr: '30 Günlük Seri',
    description: 'Wrote for 30 consecutive days',
    descriptionTr: '30 gün üst üste yazdın',
    icon: 'whatshot'
  },
  entries_10: {
    name: '10 Entries',
    nameTr: '10 Giriş',
    description: 'Completed 10 journal entries',
    descriptionTr: '10 günlük girişi tamamladın',
    icon: 'stars'
  },
  entries_50: {
    name: '50 Entries',
    nameTr: '50 Giriş',
    description: 'Completed 50 journal entries',
    descriptionTr: '50 günlük girişi tamamladın',
    icon: 'military_tech'
  },
  entries_100: {
    name: 'Century',
    nameTr: 'Yüzlük',
    description: 'Completed 100 journal entries',
    descriptionTr: '100 günlük girişi tamamladın',
    icon: 'emoji_events'
  },
  mood_tracker: {
    name: 'Mood Tracker',
    nameTr: 'Duygu Takipçisi',
    description: 'Used all 5 different moods',
    descriptionTr: 'Tüm 5 farklı ruh halini kullandın',
    icon: 'mood'
  },
  word_master: {
    name: 'Word Master',
    nameTr: 'Kelime Ustası',
    description: 'Wrote over 10,000 words total',
    descriptionTr: 'Toplamda 10.000\'den fazla kelime yazdın',
    icon: 'history_edu'
  },
  early_bird: {
    name: 'Early Bird',
    nameTr: 'Erken Kuş',
    description: 'Wrote 5 entries before 8 AM',
    descriptionTr: 'Sabah 8\'den önce 5 giriş yazdın',
    icon: 'wb_sunny'
  },
  night_owl: {
    name: 'Night Owl',
    nameTr: 'Gece Kuşu',
    description: 'Wrote 5 entries after 10 PM',
    descriptionTr: 'Akşam 10\'dan sonra 5 giriş yazdın',
    icon: 'nightlight'
  }
};

// Get user badges
export const getUserBadges = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM badges WHERE user_id = $1 ORDER BY earned_at DESC`,
      [userId]
    );

    // Enhance with badge definitions
    const badges = result.rows.map(badge => ({
      ...badge,
      ...(BADGE_DEFINITIONS[badge.badge_type] || {})
    }));

    res.json({ 
      badges,
      availableBadges: Object.entries(BADGE_DEFINITIONS).map(([type, def]) => ({
        type,
        ...def,
        earned: badges.some(b => b.badge_type === type)
      }))
    });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ error: "Server error while fetching badges" });
  }
};

// Check and award badges
export const checkAndAwardBadges = async (req, res) => {
  const userId = req.user.id;

  try {
    const newBadges = [];

    // Get user stats
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT mood) as unique_moods,
        COALESCE(SUM(LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1), 0) as total_words
       FROM journal_entries WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const totalEntries = parseInt(stats.total_entries);
    const uniqueMoods = parseInt(stats.unique_moods);
    const totalWords = parseInt(stats.total_words);

    // Get existing badges
    const existingBadgesResult = await pool.query(
      `SELECT badge_type FROM badges WHERE user_id = $1`,
      [userId]
    );
    const existingBadges = new Set(existingBadgesResult.rows.map(b => b.badge_type));

    // Check first entry
    if (totalEntries >= 1 && !existingBadges.has('first_entry')) {
      await awardBadge(userId, 'first_entry');
      newBadges.push('first_entry');
    }

    // Check entry milestones
    if (totalEntries >= 10 && !existingBadges.has('entries_10')) {
      await awardBadge(userId, 'entries_10');
      newBadges.push('entries_10');
    }

    if (totalEntries >= 50 && !existingBadges.has('entries_50')) {
      await awardBadge(userId, 'entries_50');
      newBadges.push('entries_50');
    }

    if (totalEntries >= 100 && !existingBadges.has('entries_100')) {
      await awardBadge(userId, 'entries_100');
      newBadges.push('entries_100');
    }

    // Check mood tracker
    if (uniqueMoods >= 5 && !existingBadges.has('mood_tracker')) {
      await awardBadge(userId, 'mood_tracker');
      newBadges.push('mood_tracker');
    }

    // Check word master
    if (totalWords >= 10000 && !existingBadges.has('word_master')) {
      await awardBadge(userId, 'word_master');
      newBadges.push('word_master');
    }

    // Check streak badges
    const streakResult = await pool.query(
      `SELECT DISTINCT date FROM journal_entries WHERE user_id = $1 ORDER BY date DESC`,
      [userId]
    );

    if (streakResult.rows.length > 0) {
      const dates = streakResult.rows.map(row => new Date(row.date));
      let longestStreak = 1;
      let tempStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      if (longestStreak >= 7 && !existingBadges.has('streak_7')) {
        await awardBadge(userId, 'streak_7');
        newBadges.push('streak_7');
      }

      if (longestStreak >= 30 && !existingBadges.has('streak_30')) {
        await awardBadge(userId, 'streak_30');
        newBadges.push('streak_30');
      }
    }

    res.json({ 
      newBadges: newBadges.map(type => ({ type, ...BADGE_DEFINITIONS[type] })),
      message: newBadges.length > 0 ? 'New badges earned!' : 'No new badges'
    });
  } catch (error) {
    console.error("Check badges error:", error);
    res.status(500).json({ error: "Server error while checking badges" });
  }
};

// Helper function to award a badge
async function awardBadge(userId, badgeType) {
  const badge = BADGE_DEFINITIONS[badgeType];
  if (!badge) return;

  await pool.query(
    `INSERT INTO badges (user_id, badge_type, badge_name, description) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT DO NOTHING`,
    [userId, badgeType, badge.name, badge.description]
  );
}

// Export badge definitions for frontend
export const getBadgeDefinitions = (req, res) => {
  res.json({ definitions: BADGE_DEFINITIONS });
};
