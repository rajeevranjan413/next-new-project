import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cc_dev_secret_change_in_prod';

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { type, value, countryCode = '', password, name = '' } = req.body;

  if (!type || !value) return res.status(400).json({ success: false, error: 'type and value are required' });
  if (!password || password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

  const target = type === 'phone' ? value.trim() : value.trim().toLowerCase();
  const query  = type === 'phone' ? { phone: target, countryCode } : { email: target };

  const existing = await User.findOne(query).select('+passwordHash');
  if (existing?.passwordHash) {
    return res.status(409).json({ success: false, error: 'Account already exists. Please log in.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = existing
    ? await User.findByIdAndUpdate(existing._id, { passwordHash, name: name || existing.name, isVerified: true }, { new: true })
    : await User.create({ ...query, passwordHash, name, isVerified: true });

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, phone: user.phone, email: user.email, countryCode: user.countryCode, walletBalance: user.walletBalance || 0 },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { type, value, countryCode = '', password } = req.body;

  if (!type || !value || !password) {
    return res.status(400).json({ success: false, error: 'type, value and password are required' });
  }

  const target = type === 'phone' ? value.trim() : value.trim().toLowerCase();
  const query  = type === 'phone' ? { phone: target, countryCode } : { email: target };

  const user = await User.findOne(query).select('+passwordHash');
  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, error: 'No account found. Please sign up first.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, error: 'Incorrect password' });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, phone: user.phone, email: user.email, countryCode: user.countryCode, walletBalance: user.walletBalance || 0 },
  });
});

// ── POST /api/auth/wallet ─────────────────────────────────────────────────────
router.post('/wallet', async (req, res) => {
  const { walletAddress, walletName } = req.body;
  if (!walletAddress) return res.status(400).json({ success: false, error: 'walletAddress is required' });

  let user = await User.findOne({ walletAddress });
  if (!user) user = await User.create({ walletAddress, walletName, isVerified: true });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name || walletName, walletAddress, walletName, walletBalance: user.walletBalance || 0 },
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const { sub } = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = await User.findById(sub).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
