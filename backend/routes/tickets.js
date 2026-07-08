import { Router } from 'express';
import Ticket from '../models/Ticket.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

// Express 4 doesn't forward rejected promises to the error handler — wrap so
// thrown/async errors (e.g. a CastError from an invalid :id) reach errorHandler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const CHANNEL_LABELS = { tg: 'Telegram', wa: 'WhatsApp', email: 'Email' };

// Short human-friendly reference, e.g. "TKT-8F3KQ2". Collisions are retried below.
function makeRef() {
  return 'TKT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── POST /api/tickets — submit a ticket (public: guests + logged-in users) ──────
router.post('/', asyncHandler(optionalAuth), asyncHandler(async (req, res) => {
  const { channel, contact, description } = req.body;

  if (!channel || !CHANNEL_LABELS[channel]) {
    return res.status(400).json({ success: false, error: 'Valid channel is required' });
  }
  if (!contact?.trim())     return res.status(400).json({ success: false, error: 'Contact is required' });
  if (!description?.trim())  return res.status(400).json({ success: false, error: 'Description is required' });

  const u = req.user;
  const doc = {
    channel,
    channelLabel: CHANNEL_LABELS[channel],
    contact: contact.trim(),
    description: description.trim(),
    user: u?._id || null,
    isGuest: !u,
    userSnapshot: u
      ? { name: u.name || '', email: u.email || '', phone: u.phone || '', countryCode: u.countryCode || '' }
      : {},
    status: 'open',
  };

  // Retry a couple of times in the rare case of a ref collision.
  let ticket;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      ticket = await Ticket.create({ ...doc, ref: makeRef() });
      break;
    } catch (err) {
      if (err?.code === 11000 && attempt < 2) continue; // duplicate ref — retry
      throw err;
    }
  }

  res.status(201).json({
    success: true,
    ticket: { ref: ticket.ref, status: ticket.status, channelLabel: ticket.channelLabel, createdAt: ticket.createdAt },
  });
}));

// ── GET /api/tickets — list tickets (admin) ─────────────────────────────────────
router.get('/', adminAuth, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 20);
  const status = req.query.status?.trim();
  const search = req.query.search?.trim() || '';

  const filter = {};
  if (status && ['open', 'in_progress', 'resolved'].includes(status)) filter.status = status;
  if (search) {
    filter.$or = [
      { ref:         { $regex: search, $options: 'i' } },
      { contact:     { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'userSnapshot.name':  { $regex: search, $options: 'i' } },
      { 'userSnapshot.email': { $regex: search, $options: 'i' } },
    ];
  }

  const [tickets, total, openCount, progressCount, resolvedCount] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Ticket.countDocuments(filter),
    Ticket.countDocuments({ status: 'open' }),
    Ticket.countDocuments({ status: 'in_progress' }),
    Ticket.countDocuments({ status: 'resolved' }),
  ]);

  res.json({
    success: true,
    tickets, total, page, pages: Math.ceil(total / limit) || 1,
    counts: { open: openCount, in_progress: progressCount, resolved: resolvedCount },
  });
}));

// ── PATCH /api/tickets/:id — update status / note (admin) ───────────────────────
router.patch('/:id', adminAuth, asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const update = {};
  if (status !== undefined) {
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    update.status = status;
  }
  if (adminNote !== undefined) update.adminNote = String(adminNote).slice(0, 2000);

  const ticket = await Ticket.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

  res.json({ success: true, ticket });
}));

export default router;
