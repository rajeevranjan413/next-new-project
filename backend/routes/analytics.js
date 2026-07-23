import { Router } from 'express';
import PreLoginSession from '../models/PreLoginSession.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { clientIp, parseUserAgent } from '../src/utils/requestMeta.js';
import { str, cleanEmail, cleanPhone, isValidSessionId } from '../src/utils/leadSanitize.js';

const router = Router();

// Express 4 doesn't forward rejected promises to the error handler — wrap so
// async errors reach errorHandler (same pattern as routes/tickets.js).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Add `val` to the $set map under `key` only when it's non-empty, so a later
// partial update (e.g. just the phone field) never wipes an earlier capture.
const putIf = (set, key, val) => { if (val) set[key] = val; };

// ── POST /api/analytics/pre-login-track ─────────────────────────────────────────
// Public (guests + logged-in). Upserts one record per `sessionId`, accumulating the
// most complete lead picture over the visitor's session.
router.post('/pre-login-track', asyncHandler(optionalAuth), asyncHandler(async (req, res) => {
  const b = req.body || {};

  const sessionId = str(b.sessionId, 100);
  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ success: false, error: 'Valid sessionId is required' });
  }

  // Server-derived metadata (authoritative — never trust the client for these).
  const ipAddress = clientIp(req);
  const userAgent = str(req.headers['user-agent'], 512);
  const device    = parseUserAgent(userAgent);
  const referrer  = str(req.get('referer') || req.get('referrer') || b.referrerUrl, 2048);

  // Build a dot-notation $set so nested sub-documents (geo/utm/device) are patched,
  // not replaced. Only meaningful values are written.
  const set = {
    ipAddress,
    userAgent,
    'device.type':           device.type,
    'device.os':             device.os,
    'device.browser':        device.browser,
    'device.browserVersion': device.browserVersion,
  };

  putIf(set, 'email',       cleanEmail(b.email));
  putIf(set, 'phoneNumber', cleanPhone(b.phoneNumber ?? b.phone));
  putIf(set, 'countryCode', str(b.countryCode, 8));
  putIf(set, 'firstName',   str(b.firstName, 80));
  putIf(set, 'lastName',    str(b.lastName, 80));

  putIf(set, 'referrerUrl', referrer);
  putIf(set, 'pageUrl',     str(b.pageUrl, 2048));

  // Client-reported geo (derived from IP by the same service the app already uses).
  const geo = b.geo || {};
  putIf(set, 'geo.country', str(geo.country, 120));
  putIf(set, 'geo.region',  str(geo.region, 120));
  putIf(set, 'geo.city',    str(geo.city, 120));

  // UTM — only overwrite when supplied, so first-touch attribution is preserved.
  const utm = b.utm || {};
  putIf(set, 'utm.source',   str(utm.source, 200));
  putIf(set, 'utm.medium',   str(utm.medium, 200));
  putIf(set, 'utm.campaign', str(utm.campaign, 200));
  putIf(set, 'utm.content',  str(utm.content, 200));
  putIf(set, 'utm.term',     str(utm.term, 200));

  if (req.user?._id) set.user = req.user._id;

  const doc = await PreLoginSession.findOneAndUpdate(
    { sessionId },
    { $set: set, $setOnInsert: { sessionId }, $inc: { eventCount: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  res.status(200).json({
    success: true,
    sessionId: doc.sessionId,
    eventCount: doc.eventCount,
  });
}));

// ── GET /api/analytics/pre-login-sessions — list (admin) ────────────────────────
router.get('/pre-login-sessions', adminAuth, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 20);
  const search = req.query.search?.trim() || '';

  const filter = {};
  if (search) {
    filter.$or = [
      { sessionId:   { $regex: search, $options: 'i' } },
      { email:       { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { ipAddress:   { $regex: search, $options: 'i' } },
    ];
  }

  const [sessions, total] = await Promise.all([
    PreLoginSession.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PreLoginSession.countDocuments(filter),
  ]);

  res.json({ success: true, sessions, total, page, pages: Math.ceil(total / limit) || 1 });
}));

export default router;
