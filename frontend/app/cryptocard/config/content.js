// Static content: ticker data, benefit cards, phone codes, form countries.
// Swap TICKER_DATA with a live API feed when going to production.

export const TICKER_DATA = [
  { s: 'BTC',  p: '67,420', c: '+2.4%', up: true  },
  { s: 'ETH',  p: '3,840',  c: '+1.8%', up: true  },
  { s: 'BNB',  p: '612',    c: '+3.1%', up: true  },
  { s: 'USDT', p: '1.00',   c: '0.0%',  up: true  },
  { s: 'SOL',  p: '178',    c: '-0.9%', up: false },
  { s: 'XRP',  p: '0.62',   c: '+1.2%', up: true  },
  { s: 'ADA',  p: '0.48',   c: '-1.4%', up: false },
  { s: 'DOGE', p: '0.14',   c: '+5.2%', up: true  },
];

export const BENEFITS = [
  { icon: 'Globe',  color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  title: '190+ Countries',      desc: 'Amazon, Flipkart, Zomato, petrol pumps & all Visa POS' },
  { icon: 'Zap',    color: '#F0B90B', bg: 'rgba(240,185,11,.1)',   title: '10% Instant Cashback', desc: '10% back on every swipe — auto-credited in USDT' },
  { icon: 'Gift',   color: '#0ECB81', bg: 'rgba(14,203,129,.12)',  title: '100 USDT Bonus',       desc: 'Welcome voucher unlocked on first 100 USDT transaction' },
  { icon: 'Wallet', color: '#a78bfa', bg: 'rgba(139,92,246,.12)',  title: 'Virtual Card FREE',    desc: 'Instant activation, no fees. Optional physical card 10 USDT' },
  { icon: 'Lock',   color: '#0ECB81', bg: 'rgba(14,203,129,.12)',  title: 'Bank Security',        desc: '256-bit SSL + biometric — non-custodial, your keys' },
  { icon: 'Bot',    color: '#F0B90B', bg: 'rgba(240,185,11,.1)',   title: 'AI Fraud Protection',  desc: '24/7 real-time monitoring on every transaction' },
];

export const PHONE_CODES = [
  { code: '+91',  flag: '🇮🇳', label: '🇮🇳 +91'  },
  { code: '+1',   flag: '🇺🇸', label: '🇺🇸 +1'   },
  { code: '+44',  flag: '🇬🇧', label: '🇬🇧 +44'  },
  { code: '+971', flag: '🇦🇪', label: '🇦🇪 +971' },
  { code: '+92',  flag: '🇵🇰', label: '🇵🇰 +92'  },
  { code: '+880', flag: '🇧🇩', label: '🇧🇩 +880' },
  { code: '+966', flag: '🇸🇦', label: '🇸🇦 +966' },
  { code: '+49',  flag: '🇩🇪', label: '🇩🇪 +49'  },
  { code: '+81',  flag: '🇯🇵', label: '🇯🇵 +81'  },
  { code: '+55',  flag: '🇧🇷', label: '🇧🇷 +55'  },
  { code: '+61',  flag: '🇦🇺', label: '🇦🇺 +61'  },
  { code: '+65',  flag: '🇸🇬', label: '🇸🇬 +65'  },
  { code: '+60',  flag: '🇲🇾', label: '🇲🇾 +60'  },
  { code: '+62',  flag: '🇮🇩', label: '🇮🇩 +62'  },
  { code: '+7',   flag: '🇷🇺', label: '🇷🇺 +7'   },
  { code: '+86',  flag: '🇨🇳', label: '🇨🇳 +86'  },
  { code: '+82',  flag: '🇰🇷', label: '🇰🇷 +82'  },
  { code: '+27',  flag: '🇿🇦', label: '🇿🇦 +27'  },
  { code: '+234', flag: '🇳🇬', label: '🇳🇬 +234' },
  { code: '+33',  flag: '🇫🇷', label: '🇫🇷 +33'  },
];

export const FORM_COUNTRIES = [
  'India', 'Pakistan', 'Bangladesh', 'UAE', 'Saudi Arabia',
  'United Kingdom', 'United States', 'Germany', 'Japan',
  'Australia', 'Singapore', 'Other',
];
