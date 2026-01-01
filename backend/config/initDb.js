import pool from "../config/database.js";

export const initDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create journal_entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        mood VARCHAR(50),
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
    `);

    // Create todos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date);
    `);

    // Add columns to journal_entries for encryption support
    await client.query(`
      ALTER TABLE journal_entries 
      ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      ALTER TABLE journal_entries 
      ADD COLUMN IF NOT EXISTS encryption_hint VARCHAR(255);
    `);
    
    // Add columns to journal_entries for media support
    await client.query(`
      ALTER TABLE journal_entries 
      ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
    `);

    // Add columns to users for 2FA and profile
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
    `);

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reminder_time TIME;
    `);

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE;
    `);

    // Create entry_media table for images and audio
    await client.query(`
      CREATE TABLE IF NOT EXISTS entry_media (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        media_type VARCHAR(20) NOT NULL,
        file_path TEXT NOT NULL,
        file_name VARCHAR(255),
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_entry_media_entry_id ON entry_media(entry_id);
    `);

    // Create badges table for achievements
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_type VARCHAR(50) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        description TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
    `);

    // Create buddies table for social features
    await client.query(`
      CREATE TABLE IF NOT EXISTS buddies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        buddy_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, buddy_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_buddies_user_id ON buddies(user_id);
    `);

    // Create templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_tr VARCHAR(100),
        content TEXT NOT NULL,
        content_tr TEXT,
        icon VARCHAR(50),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default templates if not exists
    await client.query(`
      INSERT INTO templates (name, name_tr, content, content_tr, icon, is_default)
      SELECT 'Gratitude Journal', 'Şükran Günlüğü', 
        E'Today I am grateful for:\\n\\n1. \\n2. \\n3. \\n\\nSomething good that happened today:\\n\\nHow I can make tomorrow better:',
        E'Bugün şükran duyduğum şeyler:\\n\\n1. \\n2. \\n3. \\n\\nBugün başıma gelen güzel bir şey:\\n\\nYarını nasıl daha iyi yapabilirim:',
        'favorite', true
      WHERE NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Gratitude Journal');
    `);

    await client.query(`
      INSERT INTO templates (name, name_tr, content, content_tr, icon, is_default)
      SELECT 'Daily Reflection', 'Günlük Yansıma',
        E'How am I feeling today?\\n\\nWhat did I accomplish?\\n\\nWhat challenges did I face?\\n\\nWhat did I learn?\\n\\nTomorrow''s goals:',
        E'Bugün nasıl hissediyorum?\\n\\nNe başardım?\\n\\nHangi zorluklarla karşılaştım?\\n\\nNe öğrendim?\\n\\nYarının hedefleri:',
        'self_improvement', true
      WHERE NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Daily Reflection');
    `);

    await client.query(`
      INSERT INTO templates (name, name_tr, content, content_tr, icon, is_default)
      SELECT 'Goal Tracker', 'Hedef Takibi',
        E'My main goal for today:\\n\\nSteps I took towards my goals:\\n\\nObstacles I encountered:\\n\\nProgress made (1-10):\\n\\nAdjustments for tomorrow:',
        E'Bugünkü ana hedefim:\\n\\nHedeflerime doğru attığım adımlar:\\n\\nKarşılaştığım engeller:\\n\\nİlerleme (1-10):\\n\\nYarın için düzenlemeler:',
        'flag', true
      WHERE NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Goal Tracker');
    `);

    await client.query(`
      INSERT INTO templates (name, name_tr, content, content_tr, icon, is_default)
      SELECT 'Five Minute Journal', 'Beş Dakikalık Günlük',
        E'Morning:\\nI am grateful for...\\nWhat would make today great?\\nDaily affirmation:\\n\\nEvening:\\n3 amazing things that happened today:\\nHow could I have made today better?',
        E'Sabah:\\nŞükran duyuyorum...\\nBugünü harika yapacak şey?\\nGünlük olumlamam:\\n\\nAkşam:\\nBugün olan 3 harika şey:\\nBugünü nasıl daha iyi yapabilirdim?',
        'schedule', true
      WHERE NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Five Minute Journal');
    `);

    await client.query(`
      INSERT INTO templates (name, name_tr, content, content_tr, icon, is_default)
      SELECT 'Mood Journal', 'Duygu Günlüğü',
        E'Current mood (1-10):\\n\\nWhat triggered this feeling?\\n\\nPhysical sensations I notice:\\n\\nThoughts running through my mind:\\n\\nWhat I need right now:',
        E'Şu anki ruh halim (1-10):\\n\\nBu duyguyu ne tetikledi?\\n\\nFark ettiğim fiziksel hisler:\\n\\nAklımdan geçen düşünceler:\\n\\nŞu an neye ihtiyacım var:',
        'mood', true
      WHERE NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Mood Journal');
    `);

    // Create motivational_quotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS motivational_quotes (
        id SERIAL PRIMARY KEY,
        quote TEXT NOT NULL,
        quote_tr TEXT,
        author VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default motivational quotes
    await client.query(`
      INSERT INTO motivational_quotes (quote, quote_tr, author)
      SELECT 'The only way to do great work is to love what you do.', 'Harika işler yapmanın tek yolu yaptığınız işi sevmektir.', 'Steve Jobs'
      WHERE NOT EXISTS (SELECT 1 FROM motivational_quotes WHERE author = 'Steve Jobs' AND quote LIKE 'The only way%');
    `);

    await client.query(`
      INSERT INTO motivational_quotes (quote, quote_tr, author)
      SELECT 'Write what should not be forgotten.', 'Unutulmaması gerekeni yaz.', 'Isabel Allende'
      WHERE NOT EXISTS (SELECT 1 FROM motivational_quotes WHERE author = 'Isabel Allende');
    `);

    await client.query(`
      INSERT INTO motivational_quotes (quote, quote_tr, author)
      SELECT 'Start where you are. Use what you have. Do what you can.', 'Olduğun yerden başla. Sahip olduklarını kullan. Yapabildiğini yap.', 'Arthur Ashe'
      WHERE NOT EXISTS (SELECT 1 FROM motivational_quotes WHERE author = 'Arthur Ashe');
    `);

    await client.query(`
      INSERT INTO motivational_quotes (quote, quote_tr, author)
      SELECT 'The journey of a thousand miles begins with a single step.', 'Bin millik yolculuk tek bir adımla başlar.', 'Lao Tzu'
      WHERE NOT EXISTS (SELECT 1 FROM motivational_quotes WHERE author = 'Lao Tzu');
    `);

    await client.query(`
      INSERT INTO motivational_quotes (quote, quote_tr, author)
      SELECT 'Every day is a new beginning.', 'Her gün yeni bir başlangıçtır.', 'Unknown'
      WHERE NOT EXISTS (SELECT 1 FROM motivational_quotes WHERE quote = 'Every day is a new beginning.');
    `);

    await client.query("COMMIT");
    console.log("Database tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
};
