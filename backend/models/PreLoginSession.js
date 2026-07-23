import { Schema, model } from 'mongoose';

// Pre-login / pre-signup lead + analytics sessions.
//
// One document per browser session (keyed by a client-generated `sessionId`), so
// repeated updates as a visitor fills the login/signup form UPSERT the same record
// instead of piling up duplicates. `eventCount` counts how many times the session
// was touched.
//
// PRIVACY: this stores partial PII (email/phone/name) captured before the visitor
// authenticates. Handle in line with the project's data-protection obligations —
// see the TTL note at the bottom. The password field is never captured here.
const preLoginSessionSchema = new Schema(
  {
    // Client-generated UUID, persisted in localStorage. Unique → the upsert key.
    sessionId: { type: String, required: true, unique: true, index: true },

    // ── Partial / submitted user inputs ──────────────────────────────────────
    email:       { type: String, default: '', index: true },
    phoneNumber: { type: String, default: '', index: true },
    countryCode: { type: String, default: '' },   // dial code, e.g. "+91"
    firstName:   { type: String, default: '' },
    lastName:    { type: String, default: '' },

    // ── Network metadata (captured server-side) ──────────────────────────────
    ipAddress: { type: String, default: '' },
    geo: {
      country: { type: String, default: '' },
      region:  { type: String, default: '' },
      city:    { type: String, default: '' },
    },

    // ── Browser / device metadata ────────────────────────────────────────────
    userAgent: { type: String, default: '' },
    device: {
      type:           { type: String, default: '' }, // 'mobile' | 'tablet' | 'desktop'
      os:             { type: String, default: '' },
      browser:        { type: String, default: '' },
      browserVersion: { type: String, default: '' },
    },

    // ── Attribution / traffic ────────────────────────────────────────────────
    referrerUrl: { type: String, default: '' },
    pageUrl:     { type: String, default: '' },
    utm: {
      source:   { type: String, default: '' },
      medium:   { type: String, default: '' },
      campaign: { type: String, default: '' },
      content:  { type: String, default: '' },
      term:     { type: String, default: '' },
    },

    // Optional link to a registered account, if a valid token was present
    // (usually null — this is a *pre*-login tracker).
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    // How many times this session record has been touched.
    eventCount: { type: Number, default: 0 },
  },
  // timestamps → `createdAt` (first seen) and `updatedAt` (last activity).
  { timestamps: true }
);

// Compound index for the admin "recent leads" listing.
preLoginSessionSchema.index({ createdAt: -1 });

// ── Optional retention policy ────────────────────────────────────────────────
// Uncomment to auto-expire lead sessions after N days (recommended for PII).
// Mongo's TTL monitor deletes documents whose `createdAt` is older than the window.
// const RETENTION_DAYS = Number(process.env.PRELOGIN_RETENTION_DAYS || 0);
// if (RETENTION_DAYS > 0) {
//   preLoginSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 86400 });
// }

export default model('PreLoginSession', preLoginSessionSchema);
