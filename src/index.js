/**
 * 捜索状況共有アプリ - 同期サーバー（Cloudflare Workers + D1版）
 *
 * Python版(server.py)と同じAPIを提供する。フロントエンド(public/index.html)はほぼそのまま。
 *   POST   /api/register   アカウント作成
 *   POST   /api/login      ログイン
 *   POST   /api/logout     ログアウト（トークン無効化）
 *   GET    /api/pins       ピン一覧
 *   POST   /api/pins       ピン追加
 *   GET    /api/me         自分のID・隊名・種類（member=隊員 / hq=本部）
 *   GET    /api/teams              【本部のみ】隊・招待コード・隊員の一覧
 *   POST   /api/teams              【本部のみ】隊を作成（招待コードを発行）
 *   PUT    /api/teams/:id          【本部のみ】隊の停止・再開 {active:true/false}
 *   POST   /api/teams/:id/code     【本部のみ】招待コードを再発行（古いコードは使えなくなる）
 *   DELETE /api/users/:id          【本部のみ】隊員アカウントを削除（関係のない人が登録した場合など）
 *
 * 登録：隊員は本部が発行した「招待コード」でのみ登録できる（隊名はコードから決まる）。本部は合言葉（HQ_CODE）で登録。
 * 本部の権限：どの隊のピン・要救助者（V）・写真も削除できる。隊の作成・停止、招待コードの再発行、隊員の削除ができる。
 *   PUT    /api/pins/:id   ピン更新（ログイン中なら誰でも可。作成した隊・作成者は変更不可。階・店舗・区画の追加・削除も可）
 *   DELETE /api/pins/:id   ピン削除（ピンを作成した隊のメンバーと本部）
 *   POST   /api/position   自分の現在地を送る（各隊の位置共有。最新の1件だけ保存）
 *   DELETE /api/position   自分の現在地を消す（位置共有をやめるとき）
 *   GET    /api/positions  各隊の現在地と、最終更新時刻（サーバー時刻）の一覧
 *   GET    /api/victims                 要救助者（V）の一覧
 *   POST   /api/pins/:id/victims        要救助者（V）を追加
 *   PUT    /api/victims/:id             要救助者（V）を更新（ログイン中なら誰でも可）
 *   DELETE /api/victims/:id             要救助者（V）を削除（追加した隊と本部）
 *   GET    /api/pins/:id/photos         写真の一覧（データ本体は含まない）
 *   POST   /api/pins/:id/photos         写真を追加（本文 = 画像そのもの。最大1MB。?floor=2F で階の写真にする）
 *   GET    /api/photos/:id              写真の画像
 *   DELETE /api/photos/:id              写真を削除（撮影した隊と本部）
 *   GET    /api/geocode?q=        住所 → 座標（OpenStreetMap Nominatim を中継）
 *   GET    /api/facilities?tile=14/x/y  学校・工場・発電所・大型商業施設（OpenStreetMap Overpass を中継）
 *   GET    /api/reverse?lat=&lng= 座標 → 住所
 *
 * Python版との違い:
 *   - データはファイルではなく D1(Cloudflareのデータベース) に保存 → 再デプロイしても消えない
 *   - ログイントークンもD1に保存（有効期限30日） → 再デプロイしてもログアウトされない
 *   - 受け付けるピンの項目を限定・検証し、隊名/作成者を書き換えられないようにした
 *   - 住所・階・メモ・捜索開始/終了時刻（INSARAG）を保存できる
 */

const ID_RE = /^[A-Za-z0-9_-]{3,20}$/;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30日
const PBKDF2_ITERATIONS = 100000; // Workersで使える上限
const MAX_BODY_BYTES = 16 * 1024;
const MAX_PIN_BODY_BYTES = 256 * 1024; // 階・店舗ごとの入力を含むピン用
const MAX_FLOORS = 120;
const MAX_SHOPS = 100;

// ---------- 共通 ----------
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
const err = (code, status) => json({ error: code }, status);

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));
const randomHex = (bytes) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return toHex(bits);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function readBody(request, max = MAX_BODY_BYTES) {
  const text = await request.text();
  if (text.length > max) return null;
  try {
    const body = JSON.parse(text || "{}");
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

// ---------- 認証 ----------
async function createSession(env, user) {
  const token = randomHex(24);
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, user.id, now + SESSION_TTL_MS),
    // ついでに期限切れトークンを掃除
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
  ]);
  return { token, id: user.id, team: user.team, role: user.role || "member" };
}

async function getUser(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  return env.DB.prepare(
    "SELECT u.id, u.team, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?"
  )
    .bind(token, Date.now())
    .first();
}

// 招待コード：紛らわしい文字（0/O、1/I）を除いた英大文字と数字8文字
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newInviteCode() {
  const r = crypto.getRandomValues(new Uint8Array(8));
  return [...r].map((b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}
// 入力のゆれを吸収（小文字・ハイフン・空白）
const normCode = (c) => (typeof c === "string" ? c.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16) : "");
const isHQ = (user) => !!user && user.role === "hq";

async function register(request, env) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const id = typeof body.id === "string" ? body.id : "";
  const password = typeof body.password === "string" ? body.password : "";
  let team = typeof body.team === "string" ? body.team.trim() : "";
  if (!id || !password) return err("missing", 400);
  if (!ID_RE.test(id)) return err("invalid_id", 400);
  if (password.length < 6) return err("weak_password", 400);
  if (team.length > 30 || password.length > 200) return err("invalid", 400);

  // 本部として登録するには、サーバーに設定した本部用の合言葉（HQ_CODE）が必要
  let role = "member";
  if (body.role === "hq") {
    const code = typeof body.hqCode === "string" ? body.hqCode : "";
    if (!env.HQ_CODE) return err("hq_disabled", 403);
    if (!safeEqual(code, String(env.HQ_CODE))) return err("bad_hq_code", 403);
    role = "hq";
    if (!team) team = "本部";
  } else {
    // 隊員：招待コードから隊を決める（停止中の隊のコードは使えない）
    const code = normCode(body.code);
    if (!code) return err("invite_required", 400);
    const row = await env.DB.prepare("SELECT name FROM teams WHERE code = ? AND active = 1").bind(code).first();
    if (!row) return err("bad_invite", 403);
    team = row.name;
  }

  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);
  try {
    await env.DB.prepare("INSERT INTO users (id, team, salt, hash, created_at, role) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, team, salt, hash, Date.now(), role)
      .run();
  } catch (e) {
    if (String(e).includes("UNIQUE")) return err("id_taken", 409);
    throw e;
  }
  return json(await createSession(env, { id, team, role }));
}

async function login(request, env) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const id = typeof body.id === "string" ? body.id : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = id ? await env.DB.prepare("SELECT id, team, salt, hash, role FROM users WHERE id = ?").bind(id).first() : null;
  if (!user || !safeEqual(await hashPassword(password, user.salt), user.hash)) return err("invalid_credentials", 401);
  return json(await createSession(env, user));
}

async function logout(request, env) {
  const header = request.headers.get("Authorization") || "";
  if (header.startsWith("Bearer ")) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(header.slice(7)).run();
  return json({ ok: true });
}

// ---------- ピン ----------
const PIN_COLS =
  "id, lat, lng, name, status, go, live, dead, missing, hazard, address, floor, note, start_at, end_at, floors, team, created_by, updated_by, t";

function rowToPin(r) {
  return {
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    name: r.name,
    status: r.status,
    go: r.go === null ? undefined : r.go === 1,
    live: r.live,
    dead: r.dead,
    missing: r.missing,
    hazard: r.hazard,
    address: r.address,
    floor: r.floor,
    note: r.note,
    startAt: r.start_at,
    endAt: r.end_at,
    floors: parseFloors(r.floors),
    team: r.team,
    by: r.created_by,
    updatedBy: r.updated_by,
    t: r.t,
  };
}

// ---------- 階・店舗・区画 ----------
const COUNT = (v) => Math.min(Math.max(Math.floor(Number(v) || 0), 0), 100000);
const STR = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const TIME = (v) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
};

function parseFloors(s) {
  if (!s) return null;
  try {
    const a = JSON.parse(s);
    return Array.isArray(a) && a.length ? a : null;
  } catch {
    return null;
  }
}

function cleanEntry(raw, isShop) {
  if (!raw || typeof raw !== "object") return null;
  const e = {
    status: [0, 1, 2].includes(Number(raw.status)) ? Number(raw.status) : 0,
    go: raw.go === false ? false : true,
    live: COUNT(raw.live),
    dead: COUNT(raw.dead),
    missing: COUNT(raw.missing),
    hazard: STR(raw.hazard, 200),
    note: STR(raw.note, 1000),
    startAt: TIME(raw.startAt),
    endAt: TIME(raw.endAt),
  };
  if (isShop) {
    e.id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.id) ? raw.id : "s" + randomHex(5);
    e.name = STR(raw.name, 100);
  }
  return e;
}

// 階の配列を検証して整える。階数なしなら null、不正なら false
function cleanFloors(raw) {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return false;
  if (raw.length === 0) return null;
  if (raw.length > MAX_FLOORS) return false;
  const labels = new Set();
  const floors = [];
  for (const rf of raw) {
    const f = cleanEntry(rf, false);
    if (!f) return false;
    f.label = STR(rf.label, 20);
    if (!f.label || labels.has(f.label)) return false;
    labels.add(f.label);
    const rs = Array.isArray(rf.shops) ? rf.shops : [];
    if (rs.length > MAX_SHOPS) return false;
    const ids = new Set();
    f.shops = [];
    for (const r of rs) {
      const sh = cleanEntry(r, true);
      if (!sh) return false;
      if (ids.has(sh.id)) sh.id = "s" + randomHex(5);
      ids.add(sh.id);
      f.shops.push(sh);
    }
    floors.push(f);
  }
  return floors;
}

// 状況の決め方：捜索中が1つでもあれば捜索中。全部が未捜索のときだけ未捜索、全部が捜索済みのときだけ捜索済み。
// 未捜索と捜索済みが混ざっているときは捜索中（フロント側の同名の関数と同じ決め方）
function statusRule(list) {
  if (!list.length) return null;
  if (list.some((s) => s === 1)) return 1;
  if (list.every((s) => s === 0)) return 0;
  if (list.every((s) => s === 2)) return 2;
  return 1;
}
const sumBy = (list, k) => Math.min(list.reduce((a, x) => a + x[k], 0), 100000);

// 店舗・区画がある階は、状況と人数を店舗・区画から決める。建物全体の値は階から決める
function deriveFromFloors(floors) {
  floors.forEach((f) => {
    if (f.shops.length) {
      f.status = statusRule(f.shops.map((x) => x.status));
      f.live = sumBy(f.shops, "live");
      f.dead = sumBy(f.shops, "dead");
      f.missing = sumBy(f.shops, "missing");
    }
  });
  const entries = [];
  floors.forEach((f) => (f.shops.length ? entries.push(...f.shops) : entries.push(f)));
  const starts = entries.map((e) => e.startAt).filter(Boolean);
  return {
    status: statusRule(floors.map((f) => f.status)),
    live: sumBy(floors, "live"),
    dead: sumBy(floors, "dead"),
    missing: sumBy(floors, "missing"),
    hazard: [...new Set(entries.map((e) => e.hazard).filter(Boolean))].join("／").slice(0, 200),
    go: entries.every((e) => e.go !== false),
    start_at: starts.length ? Math.min(...starts) : null,
    end_at: entries.every((e) => e.endAt) ? Math.max(...entries.map((e) => e.endAt)) : null,
  };
}

// 受け取ったピンの値を検証して、保存してよい項目だけを返す。不正なら null
function cleanPin(b) {
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 100) : "";
  if (!name) return null;
  const count = (v) => {
    const n = Math.floor(Number(v) || 0);
    return Math.min(Math.max(n, 0), 100000);
  };
  const status = [0, 1, 2].includes(Number(b.status)) ? Number(b.status) : 0;
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const time = (v) => {
    const n = Number(v);
    return v != null && v !== "" && Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  };
  const pin = {
    lat,
    lng,
    name,
    status,
    go: b.go === true ? 1 : b.go === false ? 0 : null,
    live: count(b.live),
    dead: count(b.dead),
    missing: count(b.missing),
    hazard: str(b.hazard, 200),
    address: str(b.address, 300),
    floor: str(b.floor, 30),
    note: str(b.note, 1000),
    start_at: time(b.startAt),
    end_at: time(b.endAt),
    floors: null,
  };
  const floors = cleanFloors(b.floors);
  if (floors === false) return null;
  if (floors) {
    // 階・店舗・区画がある場合、建物全体の状況・人数・危険情報・時刻は、そこから自動で決める
    const d = deriveFromFloors(floors);
    pin.status = d.status;
    pin.live = d.live;
    pin.dead = d.dead;
    pin.missing = d.missing;
    pin.hazard = d.hazard;
    pin.go = d.go ? 1 : 0;
    pin.start_at = d.start_at;
    pin.end_at = d.end_at;
    pin.floors = JSON.stringify(floors);
  }
  return pin;
}

async function listPins(env) {
  const { results } = await env.DB.prepare(`SELECT ${PIN_COLS} FROM pins ORDER BY id`).all();
  return json(results.map(rowToPin));
}

async function createPin(request, env, user) {
  const body = await readBody(request, MAX_PIN_BODY_BYTES);
  if (!body) return err("too_large", 413);
  const p = cleanPin(body);
  if (!p) return err("invalid", 400);
  const row = await env.DB.prepare(
    `INSERT INTO pins (lat, lng, name, status, go, live, dead, missing, hazard, address, floor, note, start_at, end_at,
                       floors, team, created_by, updated_by, t)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING ${PIN_COLS}`
  )
    .bind(p.lat, p.lng, p.name, p.status, p.go, p.live, p.dead, p.missing, p.hazard, p.address, p.floor, p.note,
          p.start_at, p.end_at, p.floors, user.team, user.id, user.id, Date.now())
    .first();
  return json(rowToPin(row));
}

async function updatePin(request, env, user, id) {
  const body = await readBody(request, MAX_PIN_BODY_BYTES);
  if (!body) return err("too_large", 413);
  const p = cleanPin(body);
  if (!p) return err("invalid", 400);
  // 捜索状況は他の隊が更新することもあるので、ログイン中なら誰でも更新可。
  // ただし team / created_by(作成した隊・作成者) は変更されない。
  const row = await env.DB.prepare(
    `UPDATE pins SET lat=?, lng=?, name=?, status=?, go=?, live=?, dead=?, missing=?, hazard=?,
                     address=?, floor=?, note=?, start_at=?, end_at=?, floors=?, updated_by=?, t=?
     WHERE id=? RETURNING ${PIN_COLS}`
  )
    .bind(p.lat, p.lng, p.name, p.status, p.go, p.live, p.dead, p.missing, p.hazard,
          p.address, p.floor, p.note, p.start_at, p.end_at, p.floors, user.id, Date.now(), id)
    .first();
  return row ? json(rowToPin(row)) : err("not_found", 404);
}

async function deletePin(env, user, id) {
  const pin = await env.DB.prepare("SELECT team FROM pins WHERE id = ?").bind(id).first();
  if (!pin) return json({ ok: true }); // 既に無い
  if (pin.team !== user.team && !isHQ(user)) return err("forbidden", 403); // 他の隊のピンは削除不可（本部は可）
  // ピンと一緒に、その建物の要救助者（V）と写真も消す
  await env.DB.batch([
    env.DB.prepare("DELETE FROM victims WHERE pin_id = ?").bind(id),
    env.DB.prepare("DELETE FROM photos WHERE pin_id = ?").bind(id),
    env.DB.prepare("DELETE FROM pins WHERE id = ?").bind(id),
  ]);
  return json({ ok: true });
}

// ---------- 隊の管理（本部のみ） ----------
async function listTeams(env) {
  const teams = (await env.DB.prepare("SELECT id, name, code, active, t FROM teams ORDER BY name").all()).results;
  const users = (await env.DB.prepare("SELECT id, team, role, created_at FROM users ORDER BY created_at").all()).results;
  const byTeam = {};
  for (const u of users) if (u.role !== "hq") (byTeam[u.team] = byTeam[u.team] || []).push({ id: u.id, t: u.created_at });
  return json({
    teams: teams.map((tm) => ({ id: tm.id, name: tm.name, code: tm.code, active: tm.active === 1, t: tm.t, members: byTeam[tm.name] || [] })),
    hq: users.filter((u) => u.role === "hq").map((u) => ({ id: u.id, team: u.team, t: u.created_at })),
  });
}

async function createTeam(request, env, user) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 30) : "";
  if (!name) return err("missing", 400);
  for (let i = 0; i < 5; i++) {
    try {
      const row = await env.DB.prepare(
        "INSERT INTO teams (name, code, active, created_by, t) VALUES (?, ?, 1, ?, ?) RETURNING id, name, code, active, t"
      )
        .bind(name, newInviteCode(), user.id, Date.now())
        .first();
      return json({ id: row.id, name: row.name, code: row.code, active: true, t: row.t, members: [] });
    } catch (e) {
      const m = String(e);
      if (m.includes("teams.name")) return err("team_exists", 409);
      if (!m.includes("UNIQUE")) throw e; // コードがたまたま重なったときは作り直す
    }
  }
  return err("server_error", 500);
}

async function setTeamActive(request, env, id) {
  const body = await readBody(request);
  if (!body || typeof body.active !== "boolean") return err("invalid", 400);
  const row = await env.DB.prepare("UPDATE teams SET active = ? WHERE id = ? RETURNING id").bind(body.active ? 1 : 0, id).first();
  return row ? json({ ok: true }) : err("not_found", 404);
}

async function regenTeamCode(env, id) {
  for (let i = 0; i < 5; i++) {
    try {
      const row = await env.DB.prepare("UPDATE teams SET code = ? WHERE id = ? RETURNING code").bind(newInviteCode(), id).first();
      return row ? json({ code: row.code }) : err("not_found", 404);
    } catch (e) {
      if (!String(e).includes("UNIQUE")) throw e;
    }
  }
  return err("server_error", 500);
}

async function removeUser(env, user, uid) {
  if (uid === user.id) return err("forbidden", 403); // 自分は消せない
  const u = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(uid).first();
  if (!u) return json({ ok: true });
  if (u.role === "hq") return err("forbidden", 403); // 本部アカウントはここでは消せない
  // ピン・V・写真などの記録は残す（誰が作ったかの記録として）。ログインと位置だけ消す
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(uid),
    env.DB.prepare("DELETE FROM positions WHERE user_id = ?").bind(uid),
    env.DB.prepare("DELETE FROM users WHERE id = ?").bind(uid),
  ]);
  return json({ ok: true });
}

// ---------- 要救助者（INSARAGの「V」マーク） ----------
// status: 0=要救助者の可能性(V) / 1=生存確認(L) / 2=死亡確認(D) / 3=救出・搬出済み
const VICTIM_COLS = "id, pin_id, lat, lng, floor, status, note, team, created_by, updated_by, t";

function rowToVictim(r) {
  return {
    id: r.id, pinId: r.pin_id, lat: r.lat, lng: r.lng, floor: r.floor, status: r.status, note: r.note,
    team: r.team, by: r.created_by, updatedBy: r.updated_by, t: r.t,
  };
}

function cleanVictim(b) {
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return {
    lat,
    lng,
    floor: str(b.floor, 30),
    status: [0, 1, 2, 3].includes(Number(b.status)) ? Number(b.status) : 0,
    note: str(b.note, 500),
  };
}

async function listVictims(env) {
  const { results } = await env.DB.prepare(`SELECT ${VICTIM_COLS} FROM victims ORDER BY id`).all();
  return json(results.map(rowToVictim));
}

async function createVictim(request, env, user, pinId) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const v = cleanVictim(body);
  if (!v) return err("invalid", 400);
  const pin = await env.DB.prepare("SELECT id FROM pins WHERE id = ?").bind(pinId).first();
  if (!pin) return err("not_found", 404);
  const row = await env.DB.prepare(
    `INSERT INTO victims (pin_id, lat, lng, floor, status, note, team, created_by, updated_by, t)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING ${VICTIM_COLS}`
  )
    .bind(pinId, v.lat, v.lng, v.floor, v.status, v.note, user.team, user.id, user.id, Date.now())
    .first();
  return json(rowToVictim(row));
}

async function updateVictim(request, env, user, id) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const v = cleanVictim(body);
  if (!v) return err("invalid", 400);
  // 状況（生存確認・救出済みなど）は他の隊が更新することもあるので、ログイン中なら誰でも更新可
  const row = await env.DB.prepare(
    `UPDATE victims SET lat=?, lng=?, floor=?, status=?, note=?, updated_by=?, t=? WHERE id=? RETURNING ${VICTIM_COLS}`
  )
    .bind(v.lat, v.lng, v.floor, v.status, v.note, user.id, Date.now(), id)
    .first();
  return row ? json(rowToVictim(row)) : err("not_found", 404);
}

async function deleteVictim(env, user, id) {
  const v = await env.DB.prepare("SELECT team FROM victims WHERE id = ?").bind(id).first();
  if (!v) return json({ ok: true });
  if (v.team !== user.team && !isHQ(user)) return err("forbidden", 403);
  await env.DB.prepare("DELETE FROM victims WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ---------- 写真 ----------
// 端末側で縮小してから送るので、1枚あたり最大1MB。D1にBLOBとして保存する
const PHOTO_MAX_BYTES = 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// floor: 階のラベル（"2F" など）。建物全体の写真は null
const rowToPhoto = (r) => ({ id: r.id, pinId: r.pin_id, floor: r.floor || null, size: r.size, team: r.team, by: r.created_by, t: r.t });

async function listPhotos(env, pinId) {
  const { results } = await env.DB.prepare(
    "SELECT id, pin_id, floor, content_type, size, team, created_by, t FROM photos WHERE pin_id = ? ORDER BY id"
  )
    .bind(pinId)
    .all();
  return json(results.map(rowToPhoto));
}

async function createPhoto(request, env, user, pinId, floorParam) {
  const floor = typeof floorParam === "string" && floorParam.trim() ? floorParam.trim().slice(0, 30) : null;
  const type = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  if (!PHOTO_TYPES.includes(type)) return err("invalid_type", 415);
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > PHOTO_MAX_BYTES) return err("too_large", 413);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return err("invalid", 400);
  if (buf.byteLength > PHOTO_MAX_BYTES) return err("too_large", 413);
  const pin = await env.DB.prepare("SELECT id FROM pins WHERE id = ?").bind(pinId).first();
  if (!pin) return err("not_found", 404);
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO photos (pin_id, floor, content_type, size, data, team, created_by, t)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, pin_id, floor, size, team, created_by, t`
  )
    .bind(pinId, floor, type, buf.byteLength, buf, user.team, user.id, now)
    .first();
  return json(rowToPhoto(row));
}

async function getPhoto(env, id) {
  const row = await env.DB.prepare("SELECT content_type, data FROM photos WHERE id = ?").bind(id).first();
  if (!row) return err("not_found", 404);
  const data = row.data instanceof ArrayBuffer ? row.data : new Uint8Array(row.data);
  return new Response(data, {
    headers: { "Content-Type": row.content_type, "Cache-Control": "private, max-age=86400" },
  });
}

async function deletePhoto(env, user, id) {
  const p = await env.DB.prepare("SELECT team FROM photos WHERE id = ?").bind(id).first();
  if (!p) return json({ ok: true });
  if (p.team !== user.team && !isHQ(user)) return err("forbidden", 403);
  await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ---------- 事前確認用の施設（学校・工場・発電所・大型商業施設） ----------
// OpenStreetMap のデータを Overpass API で取得。地図のタイル（ズーム14、約2.4km四方）単位で問い合わせ、7日間キャッシュする。
// 利用規約: https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances （常識的な回数で・結果はキャッシュ）
const OVERPASS = "https://overpass-api.de/api/interpreter";
const FAC_ZOOM = 14;
const FAC_MAX = 400; // 1タイルあたりの上限

function tileBBox(z, x, y) {
  const n = 2 ** z;
  const lon = (i) => (i / n) * 360 - 180;
  const lat = (j) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * j) / n))) * 180) / Math.PI;
  return { s: lat(y + 1), w: lon(x), n: lat(y), e: lon(x + 1) };
}

function facilityKind(tg) {
  if (/^(school|kindergarten|university|college)$/.test(tg.amenity || "")) return "school";
  if (tg.power === "plant" || tg.power === "substation") return "power";
  if (/^(mall|department_store)$/.test(tg.shop || "") || tg.building === "retail") return "mall";
  if (tg.man_made === "works" || tg.landuse === "industrial" || /^(industrial|factory)$/.test(tg.building || "")) return "factory";
  return null;
}

async function facilities(url, env, ctx) {
  const m = (url.searchParams.get("tile") || "").match(/^(\d+)\/(\d+)\/(\d+)$/);
  if (!m || Number(m[1]) !== FAC_ZOOM) return err("invalid", 400);
  const x = Number(m[2]), y = Number(m[3]), n = 2 ** FAC_ZOOM;
  if (x >= n || y >= n) return err("invalid", 400);
  const b = tileBBox(FAC_ZOOM, x, y), bb = `${b.s.toFixed(6)},${b.w.toFixed(6)},${b.n.toFixed(6)},${b.e.toFixed(6)}`;
  // 名前のない小さな工場の建物や変電設備は数が多すぎるので、名前があるものだけにする
  const q = `[out:json][timeout:25];(
nwr["amenity"~"^(school|kindergarten|university|college)$"](${bb});
nwr["power"="plant"](${bb});
nwr["power"="substation"]["name"](${bb});
nwr["shop"~"^(mall|department_store)$"](${bb});
nwr["building"="retail"]["name"](${bb});
nwr["man_made"="works"](${bb});
nwr["landuse"="industrial"]["name"](${bb});
nwr["building"~"^(industrial|factory)$"]["name"](${bb});
);out center tags ${FAC_MAX};`;

  const cacheKey = new Request(`https://facilities.cache/v1/${FAC_ZOOM}/${x}/${y}`);
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return new Response(hit.body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

  const upstream = await fetch(env.OVERPASS_URL || OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: "data=" + encodeURIComponent(q),
  });
  if (!upstream.ok) return err("facilities_failed", 502);
  const data = await upstream.json();
  const seen = new Set();
  const list = [];
  for (const el of data.elements || []) {
    const tg = el.tags || {};
    const kind = facilityKind(tg);
    const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
    if (!kind || lat == null || lng == null) continue;
    const key = el.type + el.id;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: key,
      kind,
      sub: tg.amenity || tg.power || tg.shop || tg.man_made || tg.building || tg.landuse || "",
      name: (tg["name:ja"] || tg.name || "").slice(0, 80),
      nameEn: (tg["name:en"] || "").slice(0, 80),
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
    });
  }
  const body = JSON.stringify({ tile: `${FAC_ZOOM}/${x}/${y}`, items: list });
  const res = new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=604800" } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

// ---------- 住所検索（OpenStreetMap Nominatim） ----------
// 利用規約: https://operations.osmfoundation.org/policies/nominatim/
//   - アプリを識別できる User-Agent を付ける / 1秒1回程度まで / 結果はキャッシュする
const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "search-share/2.0 (graduation project; Cloudflare Worker)";

async function nominatim(env, path, params, ctx) {
  const url = `${env.NOMINATIM_URL || NOMINATIM}${path}?${new URLSearchParams({ format: "jsonv2", ...params })}`;
  const cache = caches.default;
  const cacheKey = new Request(url);
  let res = await cache.match(cacheKey);
  if (!res) {
    const upstream = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://workers.dev/" } });
    if (!upstream.ok) return null;
    res = new Response(upstream.body, upstream);
    res.headers.set("Cache-Control", "public, max-age=86400");
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res.json();
}

async function geocode(url, env, ctx) {
  const q = (url.searchParams.get("q") || "").trim().slice(0, 200);
  if (!q) return err("missing", 400);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "ja";
  const data = await nominatim(env, "/search", { q, limit: "5", "accept-language": lang }, ctx);
  if (!data) return err("geocode_failed", 502);
  return json(data.map((r) => ({ lat: Number(r.lat), lng: Number(r.lon), label: r.display_name })));
}

async function reverse(url, env, ctx) {
  const lat = Number(url.searchParams.get("lat")), lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return err("missing", 400);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "ja";
  // 約10m単位に丸めてキャッシュを効かせる
  const data = await nominatim(
    env,
    "/reverse",
    { lat: lat.toFixed(4), lon: lng.toFixed(4), zoom: "18", "accept-language": lang },
    ctx
  );
  if (!data || data.error) return json({ label: "" });
  return json({ label: data.display_name || "" });
}

// ---------- 各隊の位置 ----------
const POSITION_TTL_MS = 3 * 60 * 60 * 1000; // 3時間更新がない位置は消す

async function savePosition(request, env, user) {
  const b = await readBody(request);
  if (!b) return err("too_large", 413);
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return err("invalid", 400);
  const acc = Number(b.accuracy);
  const accuracy = b.accuracy != null && Number.isFinite(acc) && acc >= 0 ? Math.min(Math.round(acc), 100000) : null;
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO positions (user_id, lat, lng, accuracy, t) VALUES (?, ?, ?, ?, ?) " +
        "ON CONFLICT(user_id) DO UPDATE SET lat = excluded.lat, lng = excluded.lng, accuracy = excluded.accuracy, t = excluded.t"
    ).bind(user.id, lat, lng, accuracy, now),
    env.DB.prepare("DELETE FROM positions WHERE t < ?").bind(now - POSITION_TTL_MS),
  ]);
  return json({ ok: true, t: now });
}

async function deletePosition(env, user) {
  await env.DB.prepare("DELETE FROM positions WHERE user_id = ?").bind(user.id).run();
  return json({ ok: true });
}

async function listPositions(env) {
  const now = Date.now();
  const { results } = await env.DB.prepare(
    "SELECT p.user_id AS id, u.team AS team, p.lat, p.lng, p.accuracy, p.t FROM positions p " +
      "JOIN users u ON u.id = p.user_id WHERE p.t > ? ORDER BY p.t DESC"
  )
    .bind(now - POSITION_TTL_MS)
    .all();
  // now: サーバーの現在時刻。端末の時計がずれていても「何分前か」を正しく出すため一緒に返す
  return json({ now, positions: results });
}

// ---------- ルーティング ----------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      if (path === "/api/register" && method === "POST") return await register(request, env);
      if (path === "/api/login" && method === "POST") return await login(request, env);
      if (path === "/api/logout" && method === "POST") return await logout(request, env);

      const user = await getUser(request, env);
      if (path === "/api/facilities") {
        if (!user) return err("unauthorized", 401);
        if (method !== "GET") return err("method_not_allowed", 405);
        return await facilities(url, env, ctx);
      }
      if (path === "/api/geocode" || path === "/api/reverse") {
        if (!user) return err("unauthorized", 401); // 外部からの乱用防止のためログイン必須
        if (method !== "GET") return err("method_not_allowed", 405);
        return path === "/api/geocode" ? await geocode(url, env, ctx) : await reverse(url, env, ctx);
      }
      if (path === "/api/me" && method === "GET") {
        if (!user) return err("unauthorized", 401);
        return json({ id: user.id, team: user.team, role: user.role || "member" });
      }
      if (path === "/api/teams" || path.startsWith("/api/teams/") || path.startsWith("/api/users/")) {
        if (!user) return err("unauthorized", 401);
        if (!isHQ(user)) return err("forbidden", 403);
        if (path === "/api/teams") {
          if (method === "GET") return await listTeams(env);
          if (method === "POST") return await createTeam(request, env, user);
          return err("method_not_allowed", 405);
        }
        let tm = path.match(/^\/api\/teams\/(\d+)$/);
        if (tm && method === "PUT") return await setTeamActive(request, env, Number(tm[1]));
        tm = path.match(/^\/api\/teams\/(\d+)\/code$/);
        if (tm && method === "POST") return await regenTeamCode(env, Number(tm[1]));
        tm = path.match(/^\/api\/users\/([A-Za-z0-9_-]{1,20})$/);
        if (tm && method === "DELETE") return await removeUser(env, user, tm[1]);
        return err("not_found", 404);
      }
      if (path === "/api/pins") {
        if (!user) return err("unauthorized", 401);
        if (method === "GET") return await listPins(env);
        if (method === "POST") return await createPin(request, env, user);
        return err("method_not_allowed", 405);
      }
      if (path === "/api/position") {
        if (!user) return err("unauthorized", 401);
        if (method === "POST" || method === "PUT") return await savePosition(request, env, user);
        if (method === "DELETE") return await deletePosition(env, user);
        return err("method_not_allowed", 405);
      }
      if (path === "/api/positions") {
        if (!user) return err("unauthorized", 401);
        if (method !== "GET") return err("method_not_allowed", 405);
        return await listPositions(env);
      }
      if (path === "/api/victims") {
        if (!user) return err("unauthorized", 401);
        if (method !== "GET") return err("method_not_allowed", 405);
        return await listVictims(env);
      }
      let r = path.match(/^\/api\/pins\/(\d+)\/(victims|photos)$/);
      if (r) {
        if (!user) return err("unauthorized", 401);
        const pinId = Number(r[1]);
        if (r[2] === "victims") {
          if (method === "POST") return await createVictim(request, env, user, pinId);
          return err("method_not_allowed", 405);
        }
        if (method === "GET") return await listPhotos(env, pinId);
        if (method === "POST") return await createPhoto(request, env, user, pinId, url.searchParams.get("floor"));
        return err("method_not_allowed", 405);
      }
      r = path.match(/^\/api\/(victims|photos)\/(\d+)$/);
      if (r) {
        if (!user) return err("unauthorized", 401);
        const id = Number(r[2]);
        if (r[1] === "victims") {
          if (method === "PUT") return await updateVictim(request, env, user, id);
          if (method === "DELETE") return await deleteVictim(env, user, id);
          return err("method_not_allowed", 405);
        }
        if (method === "GET") return await getPhoto(env, id);
        if (method === "DELETE") return await deletePhoto(env, user, id);
        return err("method_not_allowed", 405);
      }
      const m = path.match(/^\/api\/pins\/(\d+)$/);
      if (m) {
        if (!user) return err("unauthorized", 401);
        const id = Number(m[1]);
        if (method === "PUT") return await updatePin(request, env, user, id);
        if (method === "DELETE") return await deletePin(env, user, id);
        return err("method_not_allowed", 405);
      }
      return err("not_found", 404);
    } catch (e) {
      console.error(e);
      return err("server_error", 500);
    }
  },
};
