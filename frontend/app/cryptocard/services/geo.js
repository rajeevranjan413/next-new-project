// IP-based country detection for auto-selecting the country + phone code.
//
// Uses free, no-API-key, HTTPS, CORS-enabled services and only needs the ISO
// alpha-2 country code back — everything else (name, dial code, flag) is resolved
// locally from WORLD_COUNTRIES, so the app never depends on a third party for that.
//
//   Primary : ipwho.is   — no signup, no key, no hard rate limit, HTTPS + CORS
//   Fallback: ipapi.co   — no key, ~1,000 req/day, HTTPS + CORS
//
// The result is cached in localStorage for 7 days so we don't hit the network on
// every page load.

const CACHE_KEY = 'cc_geo_country';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { iso, ts } = JSON.parse(raw);
    if (!iso || Date.now() - ts > TTL_MS) return null;
    return iso;
  } catch { return null; }
}

function writeCache(iso) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ iso, ts: Date.now() })); } catch {}
}

async function fetchJSON(url, timeoutMs = 4000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Returns an ISO 3166-1 alpha-2 country code (e.g. "IN"), or null if detection
// fails. Never throws.
export async function detectCountry() {
  if (typeof window === 'undefined') return null;

  const cached = readCache();
  if (cached) return cached;

  // Primary — ipwho.is
  const a = await fetchJSON('https://ipwho.is/');
  let iso = a && a.success !== false ? a.country_code : null;

  // Fallback — ipapi.co
  if (!iso) {
    const b = await fetchJSON('https://ipapi.co/json/');
    iso = (b && (b.country_code || b.country)) || null;
  }

  if (iso) {
    iso = String(iso).toUpperCase();
    writeCache(iso);
  }
  return iso;
}
