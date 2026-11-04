/**
 * 捜索状況共有 - service worker（PWA）
 *
 * 目的：電波が悪い・圏外でもアプリを開けるようにする。
 *  - アプリ本体（index.html・Leaflet など）は端末に保存し、オフラインでも表示
 *  - 一度表示した地図タイルは端末に保存（最大 TILE_MAX 枚）→ 圏外でも見たことのある範囲の地図は出る
 *  - /api/*（ピン・位置などのデータ）はキャッシュしない。オフライン時の扱いは画面側
 *    （前回同期したデータの表示・未送信キュー）で行う
 *
 * アプリを更新したら VERSION を上げる → 古いキャッシュが削除される
 */
const VERSION = "v2.4.0";
const APP_CACHE = "app-" + VERSION;
const TILE_CACHE = "tiles-v1";
const TILE_MAX = 1500; // 約1500枚 ≒ 数十MB程度
const NET_TIMEOUT_MS = 4000; // 電波が弱いとき、これ以上待たずに保存済みの画面を出す

const APP_FILES = [
  "/",
  "/manifest.json",
  "/vendor/leaflet/leaflet.js",
  "/vendor/leaflet/leaflet.css",
  "/vendor/qrcodejs/qrcode.min.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];
const TILE_HOSTS = ["tile.openstreetmap.org", "cyberjapandata.gsi.go.jp"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(APP_CACHE)
      .then((c) => c.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("app-") && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/")) return; // データは常にサーバーへ
    if (req.mode === "navigate") return e.respondWith(networkFirst(req));
    return e.respondWith(staleWhileRevalidate(req, e));
  }
  if (TILE_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith("." + h))) {
    return e.respondWith(tile(req));
  }
});

// 画面（HTML）：まずネットから最新を取り、ダメなら/遅ければ保存済みを出す
async function networkFirst(req) {
  const cache = await caches.open(APP_CACHE);
  const net = fetch(req).then((res) => {
    if (res.ok && !res.redirected) cache.put("/", res.clone());
    return res;
  });
  const cached = (await cache.match(req)) || (await cache.match("/"));
  if (!cached) return net.catch(() => Response.error());
  const timeout = new Promise((r) => setTimeout(() => r(cached), NET_TIMEOUT_MS));
  return Promise.race([net.catch(() => cached), timeout]);
}

// JS・CSS・画像：保存済みをすぐ出し、裏でネットから更新
async function staleWhileRevalidate(req, e) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(req);
  const net = fetch(req)
    .then((res) => {
      if (res.ok && !res.redirected) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) {
    e.waitUntil(net);
    return cached;
  }
  return (await net) || Response.error();
}

// 地図タイル：保存済みがあればそれを使い、無ければ取得して保存
let puts = 0;
async function tile(req) {
  const cache = await caches.open(TILE_CACHE);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: "cors", credentials: "omit" });
    if (res.ok) {
      await cache.put(req.url, res.clone());
      if (++puts % 50 === 0) trimTiles(cache);
    }
    return res;
  } catch (err) {
    // CORS非対応のサーバーやオフライン：通常の読み込みに任せる（保存はしない）
    try {
      return await fetch(req);
    } catch (err2) {
      return Response.error();
    }
  }
}

async function trimTiles(cache) {
  const keys = await cache.keys();
  const extra = keys.length - TILE_MAX;
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]); // 古い順に削除
}
