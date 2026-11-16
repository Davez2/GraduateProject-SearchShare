-- v2.5（チームのv2.3.1で追加）: 階数・店舗・区画ごとの入力（JSON）。階数なしのピンは NULL
ALTER TABLE pins ADD COLUMN floors TEXT;
