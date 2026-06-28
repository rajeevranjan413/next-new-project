import { Schema, model } from 'mongoose';

const configSchema = new Schema({
  _id:          { type: String, default: 'singleton' },
  brandName:    { type: String, default: 'CryptoCard Pro' },
  tagline:      { type: String, default: 'The Future of Crypto Payments' },
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  websiteUrl:   { type: String, default: '' },
  logoUrl:      { type: String, default: '' },
  activeTheme:  { type: String, default: 'light' },
}, { timestamps: true, _id: false });

export default model('Config', configSchema);
