// Static, data-only config shared by panels. No JSX here — pure lookups so panels
// stay small and adding/renaming an option is a one-line change.

// ── Appearance: theme registry ──────────────────────────────────────────────────
export const THEME_REGISTRY = [
  { key: 'light',    label: 'Light',    desc: 'White · grey · minimal',   bg: '#FFFFFF', surface: '#F9FAFB', accent: '#111827', text: '#111827' },
  { key: 'white',    label: 'White',    desc: 'Clean light with gold',     bg: '#FFFFFF', surface: '#F5F5F7', accent: '#C8860A', text: '#0B0E11' },
  { key: 'dark',     label: 'Dark',     desc: 'BNB-style dark',            bg: '#0B0E11', surface: '#1E2329', accent: '#F0B90B', text: '#EAECEF' },
  { key: 'charcoal', label: 'Charcoal', desc: 'iOS-style warm dark',       bg: '#1C1C1E', surface: '#2C2C2E', accent: '#F0B90B', text: '#F2F2F7' },
  { key: 'midnight', label: 'Midnight', desc: 'Pure black AMOLED',         bg: '#000000', surface: '#111111', accent: '#F0B90B', text: '#FFFFFF'  },
  { key: 'obsidian', label: 'Obsidian', desc: 'Deep blue-black galaxy',    bg: '#0D0D15', surface: '#13131E', accent: '#F0B90B', text: '#E8E8F0' },
];

// ── Tickets ─────────────────────────────────────────────────────────────────────
export const TICKET_CHANNELS = {
  tg:    { label: 'Telegram', color: '#229ED9' },
  wa:    { label: 'WhatsApp', color: '#25D366' },
  email: { label: 'Email',    color: '#EA4335' },
};
export const TICKET_STATUS_META = {
  open:        { label: 'Open',        badge: 'bBlue'  },
  in_progress: { label: 'In Progress', badge: 'bAmber' },
  resolved:    { label: 'Resolved',    badge: 'bGreen' },
};
export const TICKET_STATUS_FILTERS = [
  { key: '',            label: 'All' },
  { key: 'open',        label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved' },
];

// ── Orders ──────────────────────────────────────────────────────────────────────
export const ORDER_STAGE_META = {
  order_placed:     { label: 'Order Placed',     badge: 'bBlue'  },
  payment_verified: { label: 'Payment Verified', badge: 'bAmber' },
  card_production:  { label: 'Card Production',   badge: 'bAmber' },
  shipped:          { label: 'Shipped',          badge: 'bBlue'  },
  out_for_delivery: { label: 'Out for Delivery', badge: 'bAmber' },
  delivered:        { label: 'Delivered',        badge: 'bGreen' },
  cancelled:        { label: 'Cancelled',        badge: 'bGrey'  },
};
export const ORDER_FILTERS = [
  { key: '',                 label: 'All' },
  { key: 'order_placed',     label: 'Placed' },
  { key: 'payment_verified', label: 'Verified' },
  { key: 'card_production',  label: 'Production' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
  { key: 'cancelled',        label: 'Cancelled' },
];
export const PAY_LABEL = { crypto: 'Crypto (USDT)', cod: 'Cash on Delivery' };

// ── Add-funds requests ────────────────────────────────────────────────────────────
export const FUND_STATUS_META = {
  pending:  { label: 'Pending',  badge: 'bAmber' },
  approved: { label: 'Approved', badge: 'bGreen' },
  rejected: { label: 'Rejected', badge: 'bGrey'  },
};
export const FUND_FILTERS = [
  { key: '',         label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];
// Maps the payment-panel network id to a readable label.
export const FUND_NETWORK_LABEL = { trc20: 'USDT · TRC-20', bep20: 'USDT · BEP-20' };

// ── Voucher popup ───────────────────────────────────────────────────────────────
// Placeholders double as the built-in fallback copy so the admin sees what a
// blank field will render as on the live app.
export const VOUCHER_PLACEHOLDERS = {
  limitedText: 'LIMITED — Today Only',
  title:       'Apply Today & Get',
  highlight:   '100 USDT FREE',
  subtitle:    'Welcome bonus for new applicants — today only!',
  amount:      '100 USDT',
  bonusNote:   'Min. 100 USDT transaction → auto-claimed to wallet',
  ctaText:     'Apply Now — Claim 100 USDT',
  skipText:    "No thanks, I'll miss this",
};

// ── Payment networks (Settings + Send panels) ───────────────────────────────────
export const NETWORK_META = {
  bnb: { label: 'BNB Smart Chain', sub: 'USDT · BEP-20', color: '#F0B90B' },
  trx: { label: 'Tron',            sub: 'USDT · TRC-20', color: '#EF0027' },
};
export function networkMeta(network) {
  const key = String(network || '').toLowerCase();
  return NETWORK_META[key] || { label: network, sub: 'Payment network', color: '#6366f1' };
}
