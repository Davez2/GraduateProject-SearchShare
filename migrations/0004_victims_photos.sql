-- v2.4: 要救助者の位置（INSARAGの「V」マーク）と建物の写真

-- 要救助者（V）: 建物（ピン）の中・周辺の、要救助者がいる（可能性がある）地点
--   status: 0=要救助者の可能性(V) / 1=生存確認(L) / 2=死亡確認(D) / 3=救出・搬出済み
CREATE TABLE IF NOT EXISTS victims (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  pin_id     INTEGER NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  lat        REAL NOT NULL,
  lng        REAL NOT NULL,
  floor      TEXT NOT NULL DEFAULT '',
  status     INTEGER NOT NULL DEFAULT 0,
  note       TEXT NOT NULL DEFAULT '',
  team       TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  t          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_victims_pin ON victims(pin_id);

-- 写真: 端末で縮小したJPEG等をそのままD1に保存（1枚あたり最大1MB）
CREATE TABLE IF NOT EXISTS photos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  pin_id       INTEGER NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  data         BLOB NOT NULL,
  team         TEXT NOT NULL,
  created_by   TEXT NOT NULL,
  t            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_pin ON photos(pin_id);
