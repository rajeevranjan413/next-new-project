'use client';

/* Branded SVG wallet icons — clean, distinctive, premium */

/* MetaMask — orange/tan fox trapezoid style */
function MetaMask({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#F6851B" />
      {/* Simplified fox ear + face trapezoids */}
      <polygon points="20,8 30,18 20,22 10,18" fill="#E4761B" />
      <polygon points="20,22 30,18 27,30 20,28" fill="#CD6116" />
      <polygon points="20,22 10,18 13,30 20,28" fill="#E4761B" />
      <polygon points="20,8 10,18 14,10" fill="#763D16" opacity="0.9" />
      <polygon points="20,8 30,18 26,10" fill="#763D16" opacity="0.9" />
      <circle cx="15" cy="22" r="2.2" fill="white" />
      <circle cx="25" cy="22" r="2.2" fill="white" />
      <circle cx="15" cy="22" r="1.1" fill="#1A1A1A" />
      <circle cx="25" cy="22" r="1.1" fill="#1A1A1A" />
      <path d="M17 27 q3 2 6 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* Trust Wallet — blue gradient shield */
function TrustWallet({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#twGrad)" />
      <defs>
        <linearGradient id="twGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#0500FF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path d="M20 8L10 12v9c0 5 4.5 9.6 10 11 5.5-1.4 10-6 10-11v-9L20 8z" fill="white" opacity="0.15" />
      <path d="M20 9.5L11 13v8.5c0 4.5 4 8.8 9 10.2 5-1.4 9-5.7 9-10.2V13L20 9.5z" fill="white" opacity="0.25" />
      <path d="M16 20l2.5 2.5L25 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Coinbase — dark blue with stylized blue coin */
function Coinbase({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1652F0" />
      <circle cx="20" cy="20" r="11" fill="white" />
      <path d="M20 10.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm3.8 13.3H16.2a.3.3 0 0 1-.3-.3V17a.3.3 0 0 1 .3-.3h7.6c.2 0 .3.1.3.3v6.5c0 .2-.1.3-.3.3z" fill="#1652F0" />
    </svg>
  );
}

/* Rainbow — gradient arc */
function Rainbow({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1A1B1F" />
      <path d="M7 28a13 13 0 0 1 26 0" stroke="#F00" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M9.5 28a10.5 10.5 0 0 1 21 0" stroke="#F90" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M12 28a8 8 0 0 1 16 0" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M14.5 28a5.5 5.5 0 0 1 11 0" stroke="#0F0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M17 28a3 3 0 0 1 6 0" stroke="#4A90E2" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ZenGo — cyan/teal with key icon */
function ZenGo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1A1B1F" />
      <circle cx="16" cy="17" r="5.5" stroke="#00D4FF" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="17" r="2" fill="#00D4FF" />
      <path d="M20 20l8 8" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 25h3v3" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Trezor — forest green shield with T */
function Trezor({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1D2D20" />
      <path d="M20 7L10 11.5v9.2c0 5.2 4.4 10 10 11.8 5.6-1.8 10-6.6 10-11.8V11.5L20 7z" fill="#27AE60" opacity="0.25" />
      <path d="M20 8.5L11 12.5v8.7c0 4.8 4 9.2 9 11 5-1.8 9-6.2 9-11v-8.7L20 8.5z" stroke="#27AE60" strokeWidth="1.5" fill="none" />
      <rect x="16" y="16" width="8" height="1.8" rx="0.9" fill="#27AE60" />
      <rect x="19.1" y="16" width="1.8" height="8" rx="0.9" fill="#27AE60" />
    </svg>
  );
}

const MAP = {
  MetaMask,
  TrustWallet,
  Coinbase,
  Rainbow,
  ZenGo,
  Trezor,
};

export function WalletIcon({ id, size = 40 }) {
  const Icon = MAP[id];
  if (!Icon) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#2B3139" />
        <circle cx="20" cy="17" r="7" stroke="#848E9C" strokeWidth="2" fill="none" />
        <path d="M14 28c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#848E9C" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return <Icon size={size} />;
}
