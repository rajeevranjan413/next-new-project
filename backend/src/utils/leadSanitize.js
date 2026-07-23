// Pure, dependency-free sanitizers for pre-login lead inputs. Extracted from the
// route so they can be unit-tested without spinning up Express or Mongoose.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Loose opaque-id check for the client session id — long enough, safe charset.
export const SID_RE = /^[A-Za-z0-9._-]{8,100}$/;

// Coerce to a trimmed, length-clamped string. Non-string/number → ''.
export function str(v, max = 255) {
  return (typeof v === 'string' || typeof v === 'number')
    ? String(v).trim().slice(0, max)
    : '';
}

// Valid email → normalized (lowercased); anything malformed → '' (silently dropped).
export function cleanEmail(v) {
  const s = str(v, 254).toLowerCase();
  return EMAIL_RE.test(s) ? s : '';
}

// Keep a leading '+' and digits; drop anything shorter than 4 digits as junk.
export function cleanPhone(v) {
  const s = str(v, 32).replace(/[^\d+]/g, '');
  const digits = s.replace(/\D/g, '');
  return digits.length >= 4 ? s : '';
}

export function isValidSessionId(v) {
  return SID_RE.test(str(v, 100));
}
