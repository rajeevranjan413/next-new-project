// ─── Backward-compatibility barrel ───────────────────────────────────────────
// All data has moved to config/*. Import from there directly in new code.
// This file keeps old import paths working without changes.

export { CARD_THEMES }              from './config/theme';
export { PLANS }                    from './config/plans';
export { WALLETS }                  from './config/wallets';
export { TICKER_DATA, BENEFITS, PHONE_CODES, FORM_COUNTRIES } from './config/content';
export { LANGUAGES, COUNTRIES }     from './config/languages';
export { LANGS, CHATBOT_SYSTEM }    from './config/i18n';

// Legacy export kept for any existing usage
export const DEMO_STEPS = [
  { num: '•••• •••• •••• ••••', holder: 'YOUR NAME',    caption: 'Step 1 — Fill your personal details',      stepIcon: 'FileText',    bg: 'linear-gradient(135deg,#182035,#222d3d,#18202e)' },
  { num: '4729 •••• •••• ••••', holder: 'RAHUL SHARMA', caption: 'Step 2 — Choose your card plan',           stepIcon: 'CreditCard',  bg: 'linear-gradient(135deg,#182535,#1e2f40,#182030)' },
  { num: '4729 8301 •••• ••••', holder: 'RAHUL SHARMA', caption: 'Step 3 — Connect your wallet safely',      stepIcon: 'Link',        bg: 'linear-gradient(135deg,#182530,#1a3028,#182520)' },
  { num: '4729 8301 6247 1983', holder: 'RAHUL SHARMA', caption: 'Step 4 — Card ready + 100 USDT voucher!', stepIcon: 'CheckCircle', bg: 'linear-gradient(135deg,#1a2a30,#1e3530,#1a2520)' },
];
