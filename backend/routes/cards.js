import { Router } from 'express';
import Card from '../models/Card.js';
import { requireAuth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const str = (v, max = 60) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const PLANS  = ['Mool', 'Pro', 'Premium'];
const rand4  = () => String(Math.floor(1000 + Math.random() * 9000));

// Generates a mock Visa card. Replace with a real issuer-provider call in production.
function generateCard(holder) {
  const number = ['4729', rand4(), rand4(), rand4()].join(' ');
  const cvv    = String(Math.floor(100 + Math.random() * 900));
  const yy     = (new Date().getFullYear() + 4) % 100;
  const mm     = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  return { number, last4: number.slice(-4), cvv, expiry: `${mm}/${yy}`, holder };
}

// Owner-facing view (includes number & CVV — the card belongs to req.user).
const cardView = (c, cvv) => ({
  id: c._id, holder: c.holder, brand: c.brand,
  num: c.number, last4: c.last4, cvv: cvv ?? c.cvv,
  exp: c.expiry, type: c.type, plan: c.plan, theme: c.theme,
  status: c.status, voucherStatus: c.voucherStatus, createdAt: c.createdAt,
});

// ── POST /api/cryptocard/cards/apply — issue (or update) the user's virtual card ──
// Idempotent: a user keeps one active virtual card; re-applying refreshes plan/theme
// rather than minting a new number, so a physical order's "same number" stays true.
router.post('/apply', requireAuth, asyncHandler(async (req, res) => {
  const plan  = PLANS.includes(req.body.plan) ? req.body.plan : 'Mool';
  const theme = str(req.body.theme, 40) || 'classic';
  const type  = req.body.cardType === 'physical' ? 'physical' : 'virtual';
  const holder = str(req.body.holder, 60)
    || str(req.user.name, 60).toUpperCase()
    || 'CARD HOLDER';

  let card = await Card.findOne({ user: req.user._id, status: 'active' }).select('+cvv');

  if (card) {
    card.plan = plan; card.theme = theme; card.type = type;
    if (holder) card.holder = holder;
    await card.save();
    return res.json({ success: true, card: cardView(card), reused: true });
  }

  const gen = generateCard(holder);
  card = await Card.create({ user: req.user._id, plan, theme, type, ...gen });
  res.status(201).json({ success: true, card: cardView(card, gen.cvv), reused: false });
}));

// ── GET /api/cryptocard/cards/mine — the user's active card ───────────────────────
router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const cards = await Card.find({ user: req.user._id }).select('+cvv').sort({ createdAt: -1 }).lean();
  res.json({ success: true, cards: cards.map((c) => cardView(c)) });
}));

// ── GET /api/cryptocard/cards — admin list (issued cards) ─────────────────────────
router.get('/', adminAuth, asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);

  const [cards, total] = await Promise.all([
    Card.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('user', 'name email phone').lean(),
    Card.countDocuments(),
  ]);

  res.json({ success: true, cards, total, page, pages: Math.ceil(total / limit) || 1 });
}));

export default router;
