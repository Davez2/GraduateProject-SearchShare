# 捜索状況共有アプリ（Cloudflare Workers + D1版） v2

災害時に救助隊が「どの建物を捜索したか」を地図上で共有するWebアプリです。
Cloudflare上で24時間動くので、PCを起動しておく必要はありません。

## 主な機能

- アカウント登録・ログイン・ログアウト（ログインは30日間有効、再デプロイしてもログアウトされない）
- ピンの設置：**現在地（GPS）／地図をタップ／住所で検索** の3通り
  - 新しいピンには住所が自動入力される（座標 → 住所）
- **重複捜索の警告**：30m以内に既存のピンがあると、設置時に警告と既存ピンへのリンクを表示
- ピンの項目（INSARAG準拠）：建物名・階・住所・状況（未捜索／捜索中／捜索済み）・進入（GO／NO GO）・
  行方不明M／生存L／死亡D・危険情報・**捜索開始／終了時刻**・メモ
  - 状況を「捜索中」にすると開始時刻、「済」にすると終了時刻が自動入力される（空欄の場合のみ）
- **作成者・最終更新者と更新時刻**をピンごとに表示
- **10秒ごとの自動更新**：他の隊の変更がリロードなしで反映される（編集中のピンが他の人に更新されたら通知）
- **オフライン対応**：通信が切れても保存したピンは端末に保持され、接続が戻ると自動送信。
  画面左上に「同期 10:12」「オフライン」「未送信 N件」を表示
- **隊で絞り込み**（全隊／自隊／各隊）
- **日本語／English 切り替え**
- 背景地図の切り替え：OpenStreetMap／地理院地図／地理院 淡色／航空写真
- 昼／夜テーマ、QRコードでURL共有

## 必要なもの

- Node.js 20以降：https://nodejs.org/
- Cloudflareアカウント（無料）

## 初回デプロイ

このフォルダでターミナルを開いて、上から順に実行します。

```bash
# 1. 必要なツール(wrangler)をインストール
npm install

# 2. Cloudflareにログイン（ブラウザが開く）
npx wrangler login

# 3. データベースを作成
npx wrangler d1 create search-share-db
```

3で表示された `database_id = "xxxxxxxx-...."` を、`wrangler.jsonc` の
`REPLACE_WITH_YOUR_DATABASE_ID` の部分に貼り付けて保存します。

```bash
# 4. テーブルを作成（migrations/ のSQLを順番に適用）
npm run db:migrate

# 5. デプロイ
npm run deploy
```

最後に `https://search-share.<あなたのサブドメイン>.workers.dev` というURLが表示されれば完了です。
HTTPSなので、スマホのGPS（現在地取得）もそのまま使えます。

## 更新するとき

```bash
npm run db:migrate   # migrations/ に新しいファイルが増えたときだけ（何度実行しても安全）
npm run deploy
```

データはそのまま残ります。

> v1（住所・階・メモ・時刻なし）を既にデプロイ済みの場合も、`npm run db:migrate` → `npm run deploy` でOK。
> v1を `schema.sql` で作った場合、0001は `IF NOT EXISTS` なので問題なく、0002で列が追加されます。

## 自分のドメインで公開したい場合

Cloudflareのダッシュボード → Workers & Pages → `search-share` → Settings → Domains & Routes → Add → Custom domain
で、例えば `search.example.com` のようなサブドメインを設定できます。

## PCで動作確認（任意）

```bash
npm run db:migrate:local   # ローカル用DBを作成
npm run dev                # http://localhost:8787 で起動
```

## 権限のルール

- ピンの追加・編集：ログインしていれば誰でも可（他の隊が捜索状況を更新できるように）
  - ただし「作成した隊」「作成者」は変更できない。最後に更新した人と時刻が記録・表示される
- ピンの削除：**そのピンを作成した隊のメンバーのみ**（他の隊のピンには削除ボタンが表示されない）
- 住所検索APIもログイン必須（外部からの乱用防止）

## 住所検索について

住所 ⇄ 座標の変換は [OpenStreetMap Nominatim](https://nominatim.org/) を Worker 経由で使っています（無料・APIキー不要）。
利用規約で「1秒に1回程度まで」とされているため、結果は1日キャッシュしています。
学内発表・デモの規模なら問題ありませんが、大人数で常時使う場合は有料の地図APIへの切り替えを検討してください。

## データの確認・削除

```bash
npx wrangler d1 execute search-share-db --remote --command "SELECT id, team FROM users"
npx wrangler d1 execute search-share-db --remote --command "SELECT id, name, status, team, created_by FROM pins"
npx wrangler d1 execute search-share-db --remote --command "DELETE FROM pins"   # ピンを全部消す
```

Cloudflareのダッシュボード（Storage & Databases → D1）からも中身を見られます。

## ファイル構成

```
src/index.js         サーバー本体（Cloudflare Worker）
migrations/          データベースのテーブル定義（順番に適用される）
wrangler.jsonc       Cloudflareの設定
public/index.html    アプリ本体（フロントエンド）
public/vendor/       Leaflet 1.9.4・qrcodejs（外部CDNに依存しないよう同梱）
```

## 地図について

背景地図は画面左上のメニューで切り替えられます（選択は端末に保存されます）。

| 種類 | 提供元 | 備考 |
|---|---|---|
| OSM | [OpenStreetMap](https://www.openstreetmap.org/copyright) | 世界中で使える |
| 地理院地図 / 地理院 淡色 | [国土地理院 地理院タイル](https://maps.gsi.go.jp/development/ichiran.html) | 日本の公式地図。建物の形まで詳しい |
| 航空写真 | 国土地理院（全国最新写真・シームレス） | 建物の屋根・倒壊状況の確認に便利 |

どれも無料・APIキー不要です。地図は [Leaflet](https://leafletjs.com/) で表示しています。
画面右下の出典表示（OpenStreetMap／国土地理院）は利用規約上必要なので消さないでください。
