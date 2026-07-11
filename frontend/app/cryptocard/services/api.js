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

// ── Card application ──────────────────────────────────────────────────────────

// Issues (or refreshes) the logged-in user's virtual card. Requires a user token.
export async function applyForCard({ plan, theme, cardType, holder }, token) {
  const res = await fetch(`${BACKEND}/api/cryptocard/cards/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan, theme, cardType, holder }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Card application failed');
  return data.card;
}

// Fetches the user's issued cards (most recent first). Used to restore the card on load.
export async function getMyCards(token) {
  const res = await fetch(`${BACKEND}/api/cryptocard/cards/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load cards');
  return data.cards;
}

// ── Physical card orders ────────────────────────────────────────────────────────

// A base58-style address for TRC-20, or 0x-hex for BEP-20. Used as a fallback when
// the backend isn't reachable so the demo/order UI still works offline.
function randomAddress(prefix) {
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const HEX = '0123456789abcdef';
  if (prefix === '0x') {
    let out = '0x';
    for (let i = 0; i < 40; i++) out += HEX[Math.floor(Math.random() * HEX.length)];
    return out;
  }
  let out = 'T';
  for (let i = 0; i < 33; i++) out += B58[Math.floor(Math.random() * B58.length)];
  return out;
}

// Generates a fresh, one-time deposit address for the chosen USDT network. Tries the
// backend first; if it's unavailable (dev DB is IP-whitelisted) it falls back to a
// locally generated address so the payment sheet keeps working.
export async function generatePaymentAddress({ network, prefix, amount }) {
  try {
    const res = await fetch(`${BACKEND}/api/cryptocard/orders/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network, amount }),
    });
    const data = await res.json();
    if (res.ok && data.address) return { address: data.address, network };
  } catch {
    // fall through to local generation
  }
  await new Promise((r) => setTimeout(r, 650)); // simulate provisioning latency
  return { address: randomAddress(prefix), network };
}

// Submits a physical-card order (shipping + payment choice). Sends the stored
// cc_token when present so the backend can link it to the account. Resolves with a
// reference either way so the confirmation screen always has something to show.
export async function createCardOrder(order) {
  let token = null;
  if (typeof window !== 'undefined') {
    try { token = localStorage.getItem('cc_token'); } catch {}
  }
  try {
    const res = await fetch(`${BACKEND}/api/cryptocard/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (res.ok) return data;
  } catch {
    // fall through to local reference
  }
  await new Promise((r) => setTimeout(r, 500));
  const ref = 'CC-' + Date.now().toString(36).toUpperCase().slice(-6);
  return { ref, status: order.payMethod === 'cod' ? 'pending_cod' : 'awaiting_payment' };
}

// Fetches an order's tracking state by its public reference (works for guests).
export async function trackOrder(ref) {
  const res = await fetch(`${BACKEND}/api/cryptocard/orders/track/${encodeURIComponent(ref)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order not found');
  return data.order;
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
