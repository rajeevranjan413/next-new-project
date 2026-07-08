import { Schema, model } from 'mongoose';

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
  voucher:      { type: voucherSchema, default: () => ({}) },
}, { timestamps: true, _id: false });

export default model('Config', configSchema);
