import { Schema, model } from 'mongoose';

// Crypto-payment settings the admin controls. `walletTron`/`walletBnb` are the
// receiving addresses shown on the payment sheet (both the physical-card order and
// the Add Funds flow). Blank = fall back to the app's generated one-time address.
// `connectWallet` drives the "Connect wallet" button: admin-set text, logo image
// and the URL it opens.
const connectWalletSchema = new Schema({
  enabled: { type: Boolean, default: false },
  text:    { type: String,  default: '' },   // button label
  logoUrl: { type: String,  default: '' },   // uploaded logo (root-relative /uploads/…)
  url:     { type: String,  default: '' },   // opens in a new tab on click
}, { _id: false });

const paymentSchema = new Schema({
  walletTron:    { type: String, default: '' },   // USDT TRC-20 receiving address
  walletBnb:     { type: String, default: '' },   // USDT BEP-20 receiving address
  connectWallet: { type: connectWalletSchema, default: () => ({}) },
}, { _id: false });

// Voucher welcome-bonus popup — content the admin can edit.
// Text fields default to '' so the frontend falls back to its localized (i18n)
// copy until an admin actually overrides them. enabled/offerMinutes/slots carry
// real defaults since they drive behaviour, not copy.
const voucherSchema = new Schema({
  enabled:      { type: Boolean, default: true },
  limitedText:  { type: String,  default: '' },   // urgency ribbon
  title:        { type: String,  default: '' },   // headline line 1
  highlight:    { type: String,  default: '' },   // gradient highlight line 2
  subtitle:     { type: String,  default: '' },
  amount:       { type: String,  default: '' },   // big number, e.g. "100 USDT"
  bonusNote:    { type: String,  default: '' },
  offerMinutes: { type: Number,  default: 15 },   // countdown length
  ctaText:      { type: String,  default: '' },
  slots:        { type: Number,  default: 47 },   // starting "slots left"
  skipText:     { type: String,  default: '' },
}, { _id: false });

const configSchema = new Schema({
  _id:          { type: String, default: 'singleton' },
  brandName:    { type: String, default: 'CryptoCard Pro' },
  tagline:      { type: String, default: 'The Future of Crypto Payments' },
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  websiteUrl:   { type: String, default: '' },
  logoUrl:      { type: String, default: '' },
  activeTheme:  { type: String, default: 'light' },
  payment:      { type: paymentSchema, default: () => ({}) },
  voucher:      { type: voucherSchema, default: () => ({}) },
}, { timestamps: true, _id: false });

export default model('Config', configSchema);
