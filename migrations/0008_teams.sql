-- v2.8: 隊（チーム）と招待コード。隊員は本部が発行した招待コードでのみ登録できる
CREATE TABLE IF NOT EXISTS teams (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  code       TEXT NOT NULL UNIQUE,      -- 招待コード（英大文字と数字8文字。表示は XXXX-XXXX）
  active     INTEGER NOT NULL DEFAULT 1, -- 0 = 停止中（招待コードで登録できない）
  created_by TEXT NOT NULL DEFAULT '',
  t          INTEGER NOT NULL
);

-- すでに登録されている隊（本部以外）を、招待コード付きで登録しておく。コードは本部の「隊の管理」で確認・再発行できる
INSERT OR IGNORE INTO teams (name, code, created_by, t)
  SELECT team, upper(hex(randomblob(4))), 'migration', CAST(strftime('%s', 'now') AS INTEGER) * 1000
  FROM users WHERE role <> 'hq' GROUP BY team;
