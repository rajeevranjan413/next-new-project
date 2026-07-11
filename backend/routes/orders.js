import { Router } from 'express';
import Order, { ORDER_STAGES, ORDER_STATUSES } from '../models/Order.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

// Express 4 doesn't forward rejected promises — wrap so async errors reach errorHandler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Short human-friendly reference, e.g. "CC-8F3KQ2". Collisions are retried on create.
const makeRef = () => 'CC-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Public-safe view of an order — enough to render the tracker without leaking the
// full address to anyone who guesses a reference.
function publicView(o) {
  return {
    ref:        o.ref,
    status:     o.status,
    design:     o.design,
    payMethod:  o.payMethod,
    payNetwork: o.payNetwork,
    amount:     o.amount,
    shipTo:     [o.shipping?.city, o.shipping?.country].filter(Boolean).join(', '),
    name:       o.userSnapshot?.name || o.shipping?.fullName || '',
    timeline:   (o.timeline || []).map((t) => ({ stage: t.stage, at: t.at, note: t.note })),
    createdAt:  o.createdAt,
  };
}

// ── POST /api/cryptocard/orders — place an order (public: guests + users) ────────
router.post('/', asyncHandler(optionalAuth), asyncHandler(async (req, res) => {
  const { design, shipping = {}, payMethod, payNetwork, payAddress, amount, cardLast4 } = req.body;

  if (!['crypto', 'cod'].includes(payMethod)) {
    return res.status(400).json({ success: false, error: 'Valid payment method is required' });
  }
  const required = ['fullName', 'line1', 'city', 'state', 'zip', 'country', 'phone'];
  for (const f of required) {
    if (!str(shipping[f])) {
      return res.status(400).json({ success: false, error: `Shipping ${f} is required` });
    }
  }

  const u = req.user;
  const doc = {
    user:    u?._id || null,
    isGuest: !u,
    userSnapshot: u
      ? { name: u.name || '', email: u.email || '', phone: u.phone || '', countryCode: u.countryCode || '' }
      : {},
    design: design === 'custom' ? 'custom' : 'standard',
    shipping: {
      fullName:    str(shipping.fullName),
      line1:       str(shipping.line1),
      line2:       str(shipping.line2),
      city:        str(shipping.city),
      state:       str(shipping.state),
      zip:         str(shipping.zip, 20),
      country:     str(shipping.country),
      countryCode: str(shipping.countryCode, 8),
      phone:       str(shipping.phone, 30),
    },
    payMethod,
    payNetwork: payMethod === 'crypto' ? str(payNetwork, 20) : '',
    payAddress: payMethod === 'crypto' ? str(payAddress, 120) : '',
    amount:     Number(amount) || 0,
    cardLast4:  str(cardLast4, 4),
    status:     'order_placed',
    timeline:   [{ stage: 'order_placed', at: new Date() }],
  };

  let order;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      order = await Order.create({ ...doc, ref: makeRef() });
      break;
    } catch (err) {
      if (err?.code === 11000 && attempt < 2) continue; // duplicate ref — retry
      throw err;
    }
  }

  res.status(201).json({ success: true, ref: order.ref, status: order.status, order: publicView(order) });
}));

// ── GET /api/cryptocard/orders/mine — the logged-in user's orders ────────────────
router.get('/mine', asyncHandler(optionalAuth), asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Login required' });
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders: orders.map(publicView) });
}));

// ── GET /api/cryptocard/orders/track/:ref — public tracking by reference ─────────
router.get('/track/:ref', asyncHandler(async (req, res) => {
  const ref = String(req.params.ref || '').trim().toUpperCase();
  const order = await Order.findOne({ ref }).lean();
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, order: publicView(order) });
}));

// ── GET /api/cryptocard/orders — admin list + stage counts ───────────────────────
router.get('/', adminAuth, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 20);
  const status = req.query.status?.trim();
  const search = req.query.search?.trim() || '';

  const filter = {};
  if (status && ORDER_STATUSES.includes(status)) filter.status = status;
  if (search) {
    filter.$or = [
      { ref:                  { $regex: search, $options: 'i' } },
      { 'shipping.fullName':  { $regex: search, $options: 'i' } },
      { 'shipping.city':      { $regex: search, $options: 'i' } },
      { 'shipping.country':   { $regex: search, $options: 'i' } },
      { 'userSnapshot.email': { $regex: search, $options: 'i' } },
    ];
  }

  const [orders, total, grouped] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  const counts = ORDER_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  grouped.forEach((g) => { if (g._id in counts) counts[g._id] = g.n; });

  res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) || 1, counts });
}));

// ── PATCH /api/cryptocard/orders/:id — admin: advance stage / note ───────────────
router.patch('/:id', adminAuth, asyncHandler(async (req, res) => {
  const { status, adminNote, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  if (status !== undefined) {
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    if (status !== order.status) {
      order.status = status;
      // Record the stage change. Reaching a stage again just refreshes its timestamp.
      const existing = order.timeline.find((t) => t.stage === status);
      if (existing) { existing.at = new Date(); if (note !== undefined) existing.note = str(note); }
      else order.timeline.push({ stage: status, at: new Date(), note: str(note) });
    }
  }
  if (adminNote !== undefined) order.adminNote = str(adminNote, 2000);

  await order.save();
  res.json({ success: true, order: order.toObject() });
}));

export default router;
