/**
 * 捜索状況共有アプリ - 同期サーバー（Cloudflare Workers + D1版）
 *
 * Python版(server.py)と同じAPIを提供する。フロントエンド(public/index.html)はほぼそのまま。
 *   POST   /api/register   アカウント作成
 *   POST   /api/login      ログイン
 *   POST   /api/logout     ログアウト（トークン無効化）
 *   GET    /api/pins       ピン一覧
 *   POST   /api/pins       ピン追加
 *   PUT    /api/pins/:id   ピン更新（ログイン中なら誰でも可。作成した隊・作成者は変更不可）
 *   DELETE /api/pins/:id   ピン削除（ピンを作成した隊のメンバーのみ）
 *   GET    /api/geocode?q=        住所 → 座標（OpenStreetMap Nominatim を中継）
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

async function readBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
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
  return { token, id: user.id, team: user.team };
}

async function getUser(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  return env.DB.prepare(
    "SELECT u.id, u.team FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?"
  )
    .bind(token, Date.now())
    .first();
}

async function register(request, env) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const id = typeof body.id === "string" ? body.id : "";
  const password = typeof body.password === "string" ? body.password : "";
  const team = typeof body.team === "string" ? body.team.trim() : "";
  if (!id || !password || !team) return err("missing", 400);
  if (!ID_RE.test(id)) return err("invalid_id", 400);
  if (password.length < 6) return err("weak_password", 400);
  if (team.length > 30 || password.length > 200) return err("invalid", 400);

  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);
  try {
    await env.DB.prepare("INSERT INTO users (id, team, salt, hash, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, team, salt, hash, Date.now())
      .run();
  } catch (e) {
    if (String(e).includes("UNIQUE")) return err("id_taken", 409);
    throw e;
  }
  return json(await createSession(env, { id, team }));
}

async function login(request, env) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const id = typeof body.id === "string" ? body.id : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = id ? await env.DB.prepare("SELECT id, team, salt, hash FROM users WHERE id = ?").bind(id).first() : null;
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
  "id, lat, lng, name, status, go, live, dead, missing, hazard, address, floor, note, start_at, end_at, team, created_by, updated_by, t";

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
    team: r.team,
    by: r.created_by,
    updatedBy: r.updated_by,
    t: r.t,
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
  return {
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
  };
}

async function listPins(env) {
  const { results } = await env.DB.prepare(`SELECT ${PIN_COLS} FROM pins ORDER BY id`).all();
  return json(results.map(rowToPin));
}

async function createPin(request, env, user) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const p = cleanPin(body);
  if (!p) return err("invalid", 400);
  const row = await env.DB.prepare(
    `INSERT INTO pins (lat, lng, name, status, go, live, dead, missing, hazard, address, floor, note, start_at, end_at,
                       team, created_by, updated_by, t)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING ${PIN_COLS}`
  )
    .bind(p.lat, p.lng, p.name, p.status, p.go, p.live, p.dead, p.missing, p.hazard, p.address, p.floor, p.note,
          p.start_at, p.end_at, user.team, user.id, user.id, Date.now())
    .first();
  return json(rowToPin(row));
}

async function updatePin(request, env, user, id) {
  const body = await readBody(request);
  if (!body) return err("too_large", 413);
  const p = cleanPin(body);
  if (!p) return err("invalid", 400);
  // 捜索状況は他の隊が更新することもあるので、ログイン中なら誰でも更新可。
  // ただし team / created_by(作成した隊・作成者) は変更されない。
  const row = await env.DB.prepare(
    `UPDATE pins SET lat=?, lng=?, name=?, status=?, go=?, live=?, dead=?, missing=?, hazard=?,
                     address=?, floor=?, note=?, start_at=?, end_at=?, updated_by=?, t=?
     WHERE id=? RETURNING ${PIN_COLS}`
  )
    .bind(p.lat, p.lng, p.name, p.status, p.go, p.live, p.dead, p.missing, p.hazard,
          p.address, p.floor, p.note, p.start_at, p.end_at, user.id, Date.now(), id)
    .first();
  return row ? json(rowToPin(row)) : err("not_found", 404);
}

async function deletePin(env, user, id) {
  const pin = await env.DB.prepare("SELECT team FROM pins WHERE id = ?").bind(id).first();
  if (!pin) return json({ ok: true }); // 既に無い
  if (pin.team !== user.team) return err("forbidden", 403); // 他の隊のピンは削除不可
  await env.DB.prepare("DELETE FROM pins WHERE id = ?").bind(id).run();
  return json({ ok: true });
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
      if (path === "/api/geocode" || path === "/api/reverse") {
        if (!user) return err("unauthorized", 401); // 外部からの乱用防止のためログイン必須
        if (method !== "GET") return err("method_not_allowed", 405);
        return path === "/api/geocode" ? await geocode(url, env, ctx) : await reverse(url, env, ctx);
      }
      if (path === "/api/pins") {
        if (!user) return err("unauthorized", 401);
        if (method === "GET") return await listPins(env);
        if (method === "POST") return await createPin(request, env, user);
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
