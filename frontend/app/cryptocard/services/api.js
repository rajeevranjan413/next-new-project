// All backend calls go through here. Set NEXT_PUBLIC_BACKEND_URL in .env.local

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signupUser({ type, value, countryCode, password, name }) {
  const res = await fetch(`${BACKEND}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, value, countryCode, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function loginWithPassword({ type, value, countryCode, password }) {
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, value, countryCode, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function authWithWallet({ walletAddress, walletName }) {
  const res = await fetch(`${BACKEND}/api/auth/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, walletName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Wallet auth failed');
  return data;
}

export async function getMe(token) {
  const res = await fetch(`${BACKEND}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unauthorized');
  return data;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export async function connectWallet(wallet) {
  const res = await fetch(`${BACKEND}/api/cryptocard/wallet/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: wallet.id, name: wallet.name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Wallet connection failed');
  return data;
}

// ── Support tickets ─────────────────────────────────────────────────────────────

// Submits a support ticket. Works for guests and logged-in users alike — if a
// cc_token is stored, it's sent so the backend can link the ticket to the account.
export async function submitTicket({ channel, contact, description }) {
  let token = null;
  if (typeof window !== 'undefined') {
    try { token = localStorage.getItem('cc_token'); } catch {}
  }

  const res = await fetch(`${BACKEND}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ channel, contact, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ticket submission failed');
  return data;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
// AI support now runs fully client-side via services/chatbot.js (getBotReply) — no
// network call, no API key, deterministic & business-accurate. The optional
// /api/cryptocard-chat LLM route is left in place for teams that want to wire a
// live model back in later.
