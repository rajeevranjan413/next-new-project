'use client';

/* Proper branded SVG icons for crypto coins */

function Coin({ size, bg, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill={bg} />
      {children}
    </svg>
  );
}

/* ── Bitcoin ── */
function BTC({ size }) {
  return (
    <Coin size={size} bg="#F7931A">
      <path d="M21.8 14.2c.3-1.9-1.2-2.9-3.2-3.6l.7-2.6-1.6-.4-.6 2.5c-.4-.1-.9-.2-1.3-.3l.6-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2l-2.2-.5-.4 1.6s1.1.3 1.1.3c.6.1.7.5.7.8L11 19.4a.6.6 0 0 1-.7.4l-1.1-.3-.8 1.8 2 .5c.4.1.8.2 1.2.3l-.7 2.7 1.6.4.7-2.6c.5.1.9.2 1.3.2l-.6 2.6 1.6.4.7-2.7c2.7.5 4.7.3 5.5-2.1.7-1.9 0-3-1.4-3.7 1-.3 1.8-1 2-2.6zm-3.6 5c-.5 1.9-3.7.9-4.7.6l.8-3.3c1 .3 4.4.8 3.9 2.7zm.5-5.1c-.4 1.8-3.2.9-4.1.6l.7-2.9c.9.2 3.8.7 3.4 2.3z" fill="white" />
    </Coin>
  );
}

/* ── Ethereum ── */
function ETH({ size }) {
  return (
    <Coin size={size} bg="#627EEA">
      <polygon points="16,5 23,16 16,13.5" fill="rgba(255,255,255,0.9)" />
      <polygon points="16,5 9,16 16,13.5" fill="rgba(255,255,255,0.6)" />
      <polygon points="16,27 23,17.5 16,20" fill="rgba(255,255,255,0.7)" />
      <polygon points="16,27 9,17.5 16,20" fill="rgba(255,255,255,1)" />
      <polygon points="16,14.5 23,16 16,19" fill="rgba(255,255,255,0.5)" />
      <polygon points="16,14.5 9,16 16,19" fill="rgba(255,255,255,0.8)" />
    </Coin>
  );
}

/* ── Binance ── */
function BNB({ size }) {
  return (
    <Coin size={size} bg="#F0B90B">
      {/* BNB rotated diamond pattern */}
      <rect x="13.5" y="7.5" width="5" height="5" rx="0.5" transform="rotate(45 16 10)" fill="#000" opacity="0.85" />
      <rect x="7" y="13.5" width="5" height="5" rx="0.5" transform="rotate(45 9.5 16)" fill="#000" opacity="0.85" />
      <rect x="20" y="13.5" width="5" height="5" rx="0.5" transform="rotate(45 22.5 16)" fill="#000" opacity="0.85" />
      <rect x="13.5" y="19.5" width="5" height="5" rx="0.5" transform="rotate(45 16 22)" fill="#000" opacity="0.85" />
      <rect x="13.5" y="13.5" width="5" height="5" rx="0.5" transform="rotate(45 16 16)" fill="#000" opacity="0.85" />
    </Coin>
  );
}

/* ── Tether ── */
function USDT({ size }) {
  return (
    <Coin size={size} bg="#26A17B">
      <rect x="9" y="10" width="14" height="2.5" rx="1.25" fill="white" />
      <rect x="14" y="10" width="4" height="12" rx="1.5" fill="white" />
      <rect x="11" y="18" width="10" height="2" rx="1" fill="white" opacity="0.7" />
    </Coin>
  );
}

/* ── Solana ── */
function SOL({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="url(#solGrad)" />
      <defs>
        <linearGradient id="solGrad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path d="M8.5 20.5h12a.5.5 0 0 1 .35.85l-2 2a.5.5 0 0 1-.35.15H6.5a.5.5 0 0 1-.35-.85l2-2a.5.5 0 0 1 .35-.15z" fill="white" />
      <path d="M8.5 14h12a.5.5 0 0 1 .35.15l2 2a.5.5 0 0 1-.35.85H10.5a.5.5 0 0 1-.35-.15l-2-2A.5.5 0 0 1 8.5 14z" fill="white" opacity="0.85" />
      <path d="M8.5 8.5h12a.5.5 0 0 1 .35.85l-2 2a.5.5 0 0 1-.35.15H6.5a.5.5 0 0 1-.35-.85l2-2A.5.5 0 0 1 8.5 8.5z" fill="white" opacity="0.7" />
    </svg>
  );
}

/* ── XRP ── */
function XRP({ size }) {
  return (
    <Coin size={size} bg="#00AAE4">
      <path d="M10 9h3.5l2.5 3 2.5-3H22l-4 4.8 4 4.7h-3.5l-2.5-3-2.5 3H10l4-4.7z" fill="white" />
      <path d="M10 20h3.5l2.5-3 2.5 3H22l-4-4.8-4 4.8z" fill="white" opacity="0.7" />
    </Coin>
  );
}

/* ── Cardano ── */
function ADA({ size }) {
  return (
    <Coin size={size} bg="#0033AD">
      <circle cx="16" cy="10" r="2" fill="white" />
      <circle cx="21" cy="13" r="1.5" fill="white" opacity="0.8" />
      <circle cx="21" cy="19" r="1.5" fill="white" opacity="0.8" />
      <circle cx="16" cy="22" r="2" fill="white" />
      <circle cx="11" cy="19" r="1.5" fill="white" opacity="0.8" />
      <circle cx="11" cy="13" r="1.5" fill="white" opacity="0.8" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.5" />
    </Coin>
  );
}

/* ── Dogecoin ── */
function DOGE({ size }) {
  return (
    <Coin size={size} bg="#C3A634">
      <path d="M11 9h5.5a7 7 0 0 1 0 14H11V9zm3 2.5v9h2.5a4.5 4.5 0 0 0 0-9H14z" fill="white" />
      <rect x="9.5" y="15" width="5" height="2" rx="1" fill="white" />
    </Coin>
  );
}

/* ── Generic fallback ── */
function DefaultCoin({ size, symbol }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#848E9C" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="11"
        fontWeight="bold" fontFamily="Arial, sans-serif">{symbol[0]}</text>
    </svg>
  );
}

const MAP = { BTC, ETH, BNB, USDT, SOL, XRP, ADA, DOGE };

export function CryptoIcon({ symbol, size = 28 }) {
  const Icon = MAP[symbol];
  if (!Icon) return <DefaultCoin size={size} symbol={symbol} />;
  return <Icon size={size} />;
}
