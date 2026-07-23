'use client';

// Lightweight pre-login lead / analytics tracker.
//
// Usage:
//   const { track } = usePreLoginTracker();
//   <input onChange={e => { setEmail(e.target.value); track({ email: e.target.value }); }} />
//
// It owns a per-browser session id, captures UTM params + geo once, accumulates the
// fields it's told about, and POSTs a debounced (500ms) snapshot to the backend.
// Every send is fire-and-forget and never throws — analytics must not disturb auth.

import { useCallback, useEffect, useRef } from 'react';
import { trackPreLogin } from '../services/api';
import { detectGeo } from '../services/geo';

const SID_KEY = 'cc_prelogin_sid';
const UTM_KEY = 'cc_utm';
const DEBOUNCE_MS = 500;

function makeId() {
  return 'sid-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// Stable session id persisted in localStorage so updates upsert one DB record.
function getOrCreateSessionId() {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : makeId();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return makeId();
  }
}

// Capture utm_* from the URL on first load and persist them, so attribution
// survives client-side navigation and a later re-open of the form.
function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {};
    for (const k of ['source', 'medium', 'campaign', 'content', 'term']) {
      const v = params.get('utm_' + k);
      if (v) fromUrl[k] = v;
    }
    if (Object.keys(fromUrl).length) {
      localStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = localStorage.getItem(UTM_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function usePreLoginTracker() {
  const sidRef   = useRef(null);
  const utmRef   = useRef({});
  const geoRef   = useRef(null);
  const accRef   = useRef({});   // accumulated field values
  const timerRef = useRef(null);

  useEffect(() => {
    sidRef.current = getOrCreateSessionId();
    utmRef.current = captureUtm();
    // Best-effort geo (country/region/city), stashed for subsequent sends.
    detectGeo().then((g) => { if (g) geoRef.current = g; }).catch(() => {});
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const flush = useCallback(() => {
    if (!sidRef.current) sidRef.current = getOrCreateSessionId();
    const g = geoRef.current;
    trackPreLogin({
      sessionId:   sidRef.current,
      ...accRef.current,
      pageUrl:     typeof window !== 'undefined' ? window.location.href : '',
      referrerUrl: typeof document !== 'undefined' ? document.referrer : '',
      utm:         utmRef.current,
      geo:         g ? { country: g.country, region: g.region, city: g.city } : undefined,
    });
  }, []);

  // Merge non-empty values into the accumulator and schedule a debounced send.
  const track = useCallback((partial) => {
    if (partial && typeof partial === 'object') {
      for (const [k, v] of Object.entries(partial)) {
        if (v !== undefined && v !== null && String(v).trim() !== '') accRef.current[k] = v;
      }
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [flush]);

  return { track };
}
