import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {getSettings, updateSettings, getUserTransactionHistory, getUserTransacions} from '../src/controllers/adminController.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cc_dev_secret_change_in_prod';

// ── POST /api/admin/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'Admin@123';

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: 'admin', role: 'admin', username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, username });
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [total, verified, withWallet, withEmail, withPhone, today] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ walletAddress: { $exists: true, $ne: null } }),
    User.countDocuments({ email: { $exists: true, $ne: '' } }),
    User.countDocuments({ phone: { $exists: true, $ne: '' } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  res.json({ success: true, stats: { total, verified, withWallet, withEmail, withPhone, today } });
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', adminAuth, async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const search = req.query.search?.trim() || '';

  const filter = search
    ? {
        $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
});


router.get('/settings', adminAuth,getSettings)
router.put('/settings', adminAuth,updateSettings)
router.get("/transactions", adminAuth,getUserTransactionHistory);
router.get("/user-transactions", adminAuth,getUserTransacions);



export default router;
