// All backend calls go through here. Set NEXT_PUBLIC_BACKEND_URL in .env.local

import { CHATBOT_SYSTEM } from '../config/i18n';

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

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(message) {
  const res = await fetch('/api/cryptocard-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, system: CHATBOT_SYSTEM }),
  });
  if (!res.ok) throw new Error('Chat API error');
  return res.json();
}
