-- 捜索状況共有アプリ D1スキーマ
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  team       TEXT NOT NULL,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS pins (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  lat        REAL NOT NULL,
  lng        REAL NOT NULL,
  name       TEXT NOT NULL,
  status     INTEGER NOT NULL DEFAULT 0,
  go         INTEGER,
  live       INTEGER NOT NULL DEFAULT 0,
  dead       INTEGER NOT NULL DEFAULT 0,
  missing    INTEGER NOT NULL DEFAULT 0,
  hazard     TEXT NOT NULL DEFAULT '',
  team       TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  t          INTEGER NOT NULL
);
