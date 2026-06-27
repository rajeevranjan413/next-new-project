// ─── Backend API Service Layer ────────────────────────────────────────────────
// All external calls go through here. Swap the mock implementations for real
// fetch/axios calls when connecting to a backend. Context + components stay
// unchanged — only this file needs to update.

import { CHATBOT_SYSTEM } from '../config/i18n';

// ── Card application ──────────────────────────────────────────────────────────

/**
 * Submit a card application.
 * @param {{ form, plan, cardType, cardTheme, walletId }} payload
 * @returns {{ success: boolean, cardId?: string, error?: string }}
 */
export async function applyForCard(payload) {
  // TODO: replace with real endpoint
  // const res = await fetch('/api/cryptocard/apply', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return res.json();

  // Mock: simulate network delay + generate card data
  await delay(1200);
  const num = [4729, rand4(), rand4(), rand4()].join(' ');
  const cvv = String(300 + Math.floor(Math.random() * 600));
  const y   = (new Date().getFullYear() + 4) % 100;
  const exp = `0${Math.floor(Math.random() * 12) + 1}/${y}`;
  const holder = `${payload.form.firstName} ${payload.form.lastName}`.trim().toUpperCase() || 'CARD HOLDER';
  return { success: true, card: { num, cvv, exp, holder } };
}

// ── Wallet connection ─────────────────────────────────────────────────────────

/**
 * Connect a wallet and fetch its USDT balance.
 * @param {{ id: string, name: string }} wallet
 * @returns {{ success: boolean, balance: string }}
 */
export async function connectWallet(wallet) {
  // TODO: replace with real WalletConnect / web3 integration
  // const res = await fetch('/api/cryptocard/wallet/connect', { ... });

  await delay(2000);
  const balance = (200 + Math.floor(Math.random() * 400)).toFixed(2);
  return { success: true, balance };
}

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Send a message to the AI assistant.
 * @param {string} message
 * @returns {{ reply: string }}
 */
export async function sendChatMessage(message) {
  const res = await fetch('/api/cryptocard-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, system: CHATBOT_SYSTEM }),
  });
  if (!res.ok) throw new Error('Chat API error');
  return res.json();
}

// ── Card details ──────────────────────────────────────────────────────────────

/**
 * Fetch an existing user's card details.
 * @param {string} userId
 * @returns {{ card: object } | null}
 */
export async function getCardDetails(userId) {
  // TODO: replace with real endpoint
  // const res = await fetch(`/api/cryptocard/card/${userId}`);
  // return res.json();
  return null;
}

// ── Ticker data ───────────────────────────────────────────────────────────────

/**
 * Fetch live crypto prices.
 * Returns null when live data is unavailable — callers fall back to TICKER_DATA.
 * @returns {Array | null}
 */
export async function getLiveTicker() {
  // TODO: connect to a price API (CoinGecko, Binance, etc.)
  // const res = await fetch('https://api.example.com/prices');
  // return res.json();
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand4()   { return Math.floor(1000 + Math.random() * 9000); }
