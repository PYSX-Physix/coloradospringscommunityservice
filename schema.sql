-- ============================================================
-- Full schema — drop and recreate all tables
-- Run this on a fresh database.
-- For existing databases, see the Migration section at the bottom.
-- ============================================================

DROP TABLE IF EXISTS attendance_history;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS saved_posts;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS posts;
DROP VIEW IF EXISTS session;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS blacklisted_words;
DROP TABLE IF EXISTS login_challenges;
DROP TABLE IF EXISTS trusted_devices;
DROP TABLE IF EXISTS recovery_codes;
DROP TABLE IF EXISTS user;

-- Users
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  isAdmin INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Two-factor authentication (TOTP)
  two_factor_enabled INTEGER NOT NULL DEFAULT 0,
  two_factor_secret TEXT,
  two_factor_enabled_at INTEGER
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Compatibility view for legacy reads while migrating endpoints
CREATE VIEW session AS
SELECT id, user_id, expires_at, created_at
FROM sessions;

-- Posts (events)
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
  image_url TEXT,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Participants
-- attended and the event_* snapshot columns are NULL until the organizer
-- checks the participant in. The event_* columns duplicate post data so that
-- the information survives if the post is later edited or deleted.
CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch() * 1000),
  -- attendance
  attended INTEGER DEFAULT 0,
  checked_in_at INTEGER,
  checked_in_by TEXT,
  -- snapshot of post data at check-in time (for attendance sheet downloads)
  event_title TEXT,
  event_description TEXT,
  event_location TEXT,
  event_start_datetime TEXT,
  event_end_datetime TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Attendance history
-- Permanent record of attended events. Rows are written here when a post is
-- deleted so that participants keep their service history indefinitely.
-- original_post_id is kept for deduplication (INSERT OR IGNORE) but has no
-- foreign key so it survives post deletion.
CREATE TABLE attendance_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  original_post_id INTEGER,       -- no FK — post may be deleted
  event_title TEXT NOT NULL,
  event_organizer TEXT,
  event_location TEXT,
  event_start_datetime TEXT,
  event_end_datetime TEXT,
  checked_in_at INTEGER,
  UNIQUE(user_id, original_post_id)
);

-- Saved posts
CREATE TABLE saved_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  saved_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Reports
CREATE TABLE reports (
  id TEXT PRIMARY KEY,             -- UUID
  reporter_id TEXT NOT NULL,
  reported_user_id TEXT,
  post_id INTEGER,                 -- nullable: user reports may not reference a post
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',   -- pending | under_review | resolved | dismissed | duplicate
  action_taken TEXT,
  notes TEXT,
  reviewed_by TEXT,
  reviewed_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (reporter_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,             -- UUID
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,              -- e.g. checked_in | event_reminder
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Blacklisted words (admin-managed, supplementary to the hardcoded list)
CREATE TABLE blacklisted_words (
  word TEXT PRIMARY KEY,
  added_at INTEGER NOT NULL
);

-- Two-factor recovery codes
-- Single-use backup codes issued when 2FA is enabled (or regenerated).
-- Only the hash of each code is stored; the plaintext is shown once.
CREATE TABLE recovery_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Trusted devices (reserved for future "remember this device" support)
CREATE TABLE trusted_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  device_name TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_used INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Login challenges
-- Short-lived record created after a correct password when 2FA is enabled.
-- No session exists yet; the challenge must be redeemed with a valid TOTP
-- or recovery code within its expiry window to obtain a session.
CREATE TABLE login_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_sessions_user_id       ON sessions(user_id);
CREATE INDEX idx_sessions_expires       ON sessions(expires_at);
CREATE INDEX idx_posts_visible          ON posts(visible);
CREATE INDEX idx_posts_start_datetime   ON posts(start_datetime);
CREATE INDEX idx_posts_user_id          ON posts(user_id);
CREATE INDEX idx_participants_post_id   ON participants(post_id);
CREATE INDEX idx_participants_user_id   ON participants(user_id);
CREATE INDEX idx_attendance_history_uid ON attendance_history(user_id);
CREATE INDEX idx_saved_posts_user_id    ON saved_posts(user_id);
CREATE INDEX idx_reports_status         ON reports(status);
CREATE INDEX idx_reports_post_id        ON reports(post_id);
CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX idx_notifications_read     ON notifications(user_id, read);
CREATE INDEX idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX idx_trusted_devices_uid    ON trusted_devices(user_id);
CREATE INDEX idx_login_challenges_uid   ON login_challenges(user_id);
CREATE INDEX idx_login_challenges_exp   ON login_challenges(expires_at);

-- ============================================================
-- Migration — run these on an existing database instead of
-- dropping and recreating everything above.
-- Skip any statement that fails with "duplicate column name".
-- ============================================================

-- user table
-- ALTER TABLE user ADD COLUMN isAdmin INTEGER DEFAULT 0;

-- sessions table
-- CREATE TABLE IF NOT EXISTS sessions ( ... );  -- copy full definition from above
-- ALTER TABLE sessions ADD COLUMN csrf_token TEXT;
-- ALTER TABLE sessions ADD COLUMN ip TEXT;
-- ALTER TABLE sessions ADD COLUMN user_agent TEXT;

-- participants table
-- ALTER TABLE participants ADD COLUMN attended INTEGER DEFAULT 0;
-- ALTER TABLE participants ADD COLUMN checked_in_at INTEGER;
-- ALTER TABLE participants ADD COLUMN checked_in_by TEXT;
-- ALTER TABLE participants ADD COLUMN event_title TEXT;
-- ALTER TABLE participants ADD COLUMN event_description TEXT;
-- ALTER TABLE participants ADD COLUMN event_location TEXT;
-- ALTER TABLE participants ADD COLUMN event_start_datetime TEXT;
-- ALTER TABLE participants ADD COLUMN event_end_datetime TEXT;

-- New tables (safe to run even if they already exist due to IF NOT EXISTS)
-- CREATE TABLE IF NOT EXISTS attendance_history ( ... );  -- copy full definition from above
-- CREATE TABLE IF NOT EXISTS notifications ( ... );
-- CREATE TABLE IF NOT EXISTS blacklisted_words ( ... );

-- reports table — original schema used different column names
-- ALTER TABLE reports ADD COLUMN id TEXT;          -- if id was INTEGER before
-- ALTER TABLE reports ADD COLUMN reporter_id TEXT;
-- ALTER TABLE reports ADD COLUMN reported_user_id TEXT;
-- ALTER TABLE reports ADD COLUMN description TEXT;
-- ALTER TABLE reports ADD COLUMN action_taken TEXT;
-- ALTER TABLE reports ADD COLUMN notes TEXT;
-- ALTER TABLE reports ADD COLUMN reviewed_by TEXT;
-- ALTER TABLE reports ADD COLUMN reviewed_at INTEGER;

-- Two-factor authentication (2FA)
-- user table
-- ALTER TABLE user ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE user ADD COLUMN two_factor_secret TEXT;
-- ALTER TABLE user ADD COLUMN two_factor_enabled_at INTEGER;

-- New tables (safe to run even if they already exist due to IF NOT EXISTS)
-- CREATE TABLE IF NOT EXISTS recovery_codes ( ... );   -- copy full definition from above
-- CREATE TABLE IF NOT EXISTS trusted_devices ( ... );
-- CREATE TABLE IF NOT EXISTS login_challenges ( ... );

-- CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON recovery_codes(user_id);
-- CREATE INDEX IF NOT EXISTS idx_trusted_devices_uid    ON trusted_devices(user_id);
-- CREATE INDEX IF NOT EXISTS idx_login_challenges_uid   ON login_challenges(user_id);
-- CREATE INDEX IF NOT EXISTS idx_login_challenges_exp   ON login_challenges(expires_at);