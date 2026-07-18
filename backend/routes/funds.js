import { Router } from 'express';
import FundRequest, { FUND_STATUSES } from '../models/FundRequest.js';
import User from '../models/User.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Express 4 doesn't forward rejected promises — wrap so async errors reach errorHandler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Short human-friendly reference, e.g. "AF-8F3KQ2". Collisions are retried on create.
const makeRef = () => 'AF-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// What the user sees for their own request (no admin note leakage).
function mineView(f) {
  return {
    ref:       f.ref,
    amount:    f.amount,
    network:   f.network,
    status:    f.status,
    createdAt: f.createdAt,
    decidedAt: f.decidedAt,
  };
}

// ── POST /api/cryptocard/funds — raise an add-funds request (login required) ─────
router.post('/', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
  const { amount, network, payAddress, txHash } = req.body;

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ success: false, error: 'A valid amount is required' });
  }

  const u = req.user;
  const doc = {
    user: u._id,
    userSnapshot: {
      name: u.name || '', email: u.email || '', phone: u.phone || '', countryCode: u.countryCode || '',
    },
    amount:     Math.min(amt, 1_000_000),
    network:    str(network, 20),
    payAddress: str(payAddress, 120),
    txHash:     str(txHash, 120),
    status:     'pending',
  };

  let fr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      fr = await FundRequest.create({ ...doc, ref: makeRef() });
      break;
    } catch (err) {
      if (err?.code === 11000 && attempt < 2) continue; // duplicate ref — retry
      throw err;
    }
  }

  res.status(201).json({ success: true, ref: fr.ref, status: fr.status, request: mineView(fr) });
}));

// ── GET /api/cryptocard/funds/mine — the logged-in user's requests ───────────────
router.get('/mine', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
  const requests = await FundRequest.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, requests: requests.map(mineView) });
}));

// ── GET /api/cryptocard/funds — admin list + status counts ───────────────────────
router.get('/', adminAuth, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 20);
  const status = req.query.status?.trim();
  const search = req.query.search?.trim() || '';

  const filter = {};
  if (status && FUND_STATUSES.includes(status)) filter.status = status;
  if (search) {
    filter.$or = [
      { ref:                 { $regex: search, $options: 'i' } },
      { 'userSnapshot.name':  { $regex: search, $options: 'i' } },
      { 'userSnapshot.email': { $regex: search, $options: 'i' } },
      { txHash:               { $regex: search, $options: 'i' } },
    ];
  }

  const [requests, total, grouped] = await Promise.all([
    FundRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    FundRequest.countDocuments(filter),
    FundRequest.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  const counts = FUND_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  grouped.forEach((g) => { if (g._id in counts) counts[g._id] = g.n; });

  res.json({ success: true, requests, total, page, pages: Math.ceil(total / limit) || 1, counts });
}));

// ── PATCH /api/cryptocard/funds/:id — admin: approve / reject ─────────────────────
// Approving credits the user's walletBalance exactly once (guarded by `credited`);
// moving a request back out of "approved" reverses the credit so the balance stays
// consistent with the request's state.
router.patch('/:id', adminAuth, asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  const fr = await FundRequest.findById(req.params.id);
  if (!fr) return res.status(404).json({ success: false, error: 'Request not found' });

  if (status !== undefined) {
    if (!FUND_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    if (status !== fr.status) {
      if (status === 'approved' && !fr.credited) {
        await User.findByIdAndUpdate(fr.user, { $inc: { walletBalance: fr.amount } });
        fr.credited = true;
      } else if (status !== 'approved' && fr.credited) {
        await User.findByIdAndUpdate(fr.user, { $inc: { walletBalance: -fr.amount } });
        fr.credited = false;
      }
      fr.status = status;
      fr.decidedAt = new Date();
    }
  }
  if (adminNote !== undefined) fr.adminNote = str(adminNote, 2000);

  await fr.save();
  res.json({ success: true, request: fr.toObject() });
}));

export default router;
