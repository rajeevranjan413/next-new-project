// Dependency-free helpers for extracting client metadata from an Express request.
// Kept pure (no Mongoose / no side effects) so they can be unit-tested in isolation.

// ── Client IP ────────────────────────────────────────────────────────────────
// Prefer proxy-set headers (the app runs behind a proxy — `trust proxy` is on),
// falling back to the socket. `X-Forwarded-For` may be a comma-separated list
// "client, proxy1, proxy2" — the left-most entry is the original client.
export function clientIp(req) {
  const xff = req.headers?.['x-forwarded-for'];
  if (xff) {
    const first = String(xff).split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const real = req.headers?.['x-real-ip'];
  if (real) return normalizeIp(String(real).trim());

  return normalizeIp(req.ip || req.socket?.remoteAddress || '');
}

// Strip the IPv4-mapped-IPv6 prefix (::ffff:127.0.0.1 → 127.0.0.1).
function normalizeIp(ip) {
  if (!ip) return '';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

// ── User-Agent parsing ───────────────────────────────────────────────────────
// A compact, allocation-light parser covering the common cases (device class, OS,
// browser + major version). Not exhaustive — good enough for lead analytics without
// pulling in a dependency. Order matters: more specific patterns are tested first.

function detectDeviceType(ua) {
  if (/\bipad\b|\btablet\b|\bplaybook\b|\bsilk\b|(android(?!.*\bmobile\b))/i.test(ua)) return 'tablet';
  if (/\bmobi|\biphone\b|\bipod\b|\bandroid\b|\bwindows phone\b|\bblackberry\b|\bopera mini\b/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectOS(ua) {
  const tests = [
    [/windows nt 10/i, 'Windows 10'],
    [/windows nt/i,    'Windows'],
    [/iphone os|ipad;|cpu os/i, 'iOS'],
    [/mac os x/i,      'macOS'],
    [/android/i,       'Android'],
    [/cros/i,          'ChromeOS'],
    [/linux/i,         'Linux'],
  ];
  for (const [re, name] of tests) if (re.test(ua)) return name;
  return '';
}

// Browser detection. Chrome's UA also contains "Safari"; Edge/Opera/Brave contain
// "Chrome" — so test the more specific brands before the generic ones.
function detectBrowser(ua) {
  const tests = [
    [/edg(?:e|ios|a)?\/([\d.]+)/i, 'Edge'],
    [/opr\/([\d.]+)/i,            'Opera'],
    [/opera[ /]([\d.]+)/i,        'Opera'],
    [/samsungbrowser\/([\d.]+)/i, 'Samsung Internet'],
    [/firefox\/([\d.]+)/i,        'Firefox'],
    [/fxios\/([\d.]+)/i,          'Firefox'],
    [/chrome\/([\d.]+)/i,         'Chrome'],
    [/crios\/([\d.]+)/i,          'Chrome'],
    [/version\/([\d.]+).*safari/i, 'Safari'],
    [/safari\/([\d.]+)/i,         'Safari'],
    [/msie ([\d.]+)/i,            'Internet Explorer'],
    [/trident.*rv:([\d.]+)/i,     'Internet Explorer'],
  ];
  for (const [re, name] of tests) {
    const m = ua.match(re);
    if (m) return { browser: name, browserVersion: (m[1] || '').split('.')[0] };
  }
  return { browser: '', browserVersion: '' };
}

export function parseUserAgent(uaRaw) {
  const ua = String(uaRaw || '');
  if (!ua) return { type: '', os: '', browser: '', browserVersion: '' };
  const { browser, browserVersion } = detectBrowser(ua);
  return {
    type: detectDeviceType(ua),
    os: detectOS(ua),
    browser,
    browserVersion,
  };
}
