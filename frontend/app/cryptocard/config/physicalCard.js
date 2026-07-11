// Physical-card ordering config: fee, USDT networks, payment window, COD policy.
// Everything the order flow needs lives here so nothing is hardcoded in the UI.

// One-time physical-card fee (matches the 10 USDT quoted across the app).
export const CARD_FEE_USDT = 10;

// Amount the user pays for a crypto order. Kept separate from the fee so a
// shipping surcharge or promo discount can be folded in later without touching UI.
export const ORDER_AMOUNT_USDT = 10;

// How long a generated one-time deposit address stays valid. The reference shows
// a MM:SS countdown starting at 60:00, i.e. a 60-minute window.
export const PAY_WINDOW_SECONDS = 60 * 60;

// Supported USDT networks. `color`/`bg` reuse the app palette conventions so the
// network badges sit naturally against the existing theme.
export const USDT_NETWORKS = [
  {
    id: 'trc20',
    name: 'Tron',
    standard: 'TRC-20',
    badge: 'TRON',
    color: '#EF0027',            // Tron brand red
    bg: 'rgba(239,0,39,.12)',
    prefix: 'T',
  },
  {
    id: 'bep20',
    name: 'BNB Smart Chain',
    standard: 'BEP-20',
    badge: 'BSC',
    color: '#F0B90B',            // BNB gold (aligns with --bnb)
    bg: 'rgba(240,185,11,.12)',
    prefix: '0x',
  },
];

export const DEFAULT_NETWORK = 'trc20';

// Cash-on-Delivery policy note shown when COD is selected.
export const COD_POLICY =
  'Pay in cash when your card arrives. Our courier collects the 10 USDT ' +
  'equivalent in your local currency on delivery. Orders dispatch within 24 ' +
  'hours and arrive in 7–10 business days. Please keep the exact amount ready.';

export const getNetwork = (id) =>
  USDT_NETWORKS.find((n) => n.id === id) || USDT_NETWORKS[0];

// Fulfilment stages for the order tracker — must stay in sync with the backend
// Order model's ORDER_STAGES. `icon` maps to a lucide icon in OrderTracking.
// `codTitle` overrides the label for Cash-on-Delivery orders (no pre-paid step).
export const ORDER_STAGES = [
  { id: 'order_placed',     title: 'Order Placed',     icon: 'check',   desc: 'We\'ve received your order' },
  { id: 'payment_verified', title: 'Payment Verified', codTitle: 'Order Confirmed', icon: 'coins', desc: 'Payment confirmed on-chain' },
  { id: 'card_production',  title: 'Card Production',  icon: 'factory', desc: 'Your card is being produced' },
  { id: 'shipped',          title: 'Shipped',          icon: 'truck',   desc: 'Handed to our courier' },
  { id: 'out_for_delivery', title: 'Out for Delivery', icon: 'rider',   desc: 'Arriving soon' },
  { id: 'delivered',        title: 'Delivered',        icon: 'home',    desc: 'Enjoy your card!' },
];

export const stageIndex = (id) => ORDER_STAGES.findIndex((s) => s.id === id);
