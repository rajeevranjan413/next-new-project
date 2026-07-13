// Shared formatting helpers used across panels.

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// Number → localized string with up to 4 decimals; blank/NaN-safe.
export function fmtAmt(n) {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

// Truncate a long string (address / tx hash) keeping the head and tail.
export function shortMid(str, head = 8, tail = 6) {
  if (!str) return '';
  return str.length > head + tail + 1 ? `${str.slice(0, head)}…${str.slice(-tail)}` : str;
}
