-- v2.6: 写真を階ごとに分けられるようにする（階のラベル。建物全体の写真は NULL）
ALTER TABLE photos ADD COLUMN floor TEXT;
