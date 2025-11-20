-- Drop existing tables to start fresh
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS saved_posts;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS posts;

-- Posts table with COMBINED datetime columns
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Participants table
CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Saved posts table
CREATE TABLE saved_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  saved_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Reports table
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_posts_visible ON posts(visible);
CREATE INDEX idx_posts_start_datetime ON posts(start_datetime);
CREATE INDEX idx_participants_post_id ON participants(post_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_reports_status ON reports(status);