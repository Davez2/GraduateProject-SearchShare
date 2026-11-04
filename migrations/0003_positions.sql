-- v2.2: 各隊のGPS位置（本部が地図で確認するため）。1ユーザーにつき最新の1件だけを持つ
CREATE TABLE IF NOT EXISTS positions (
  user_id  TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lat      REAL NOT NULL,
  lng      REAL NOT NULL,
  accuracy REAL,
  t        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_positions_t ON positions(t);
