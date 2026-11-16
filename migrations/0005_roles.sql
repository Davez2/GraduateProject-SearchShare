-- v2.5（チームのv2.3.1で追加）: アカウントの種類（member=隊員、hq=本部）。現時点では権限の違いはない
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
