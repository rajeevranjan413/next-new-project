import { Router } from 'express';
import WalletSession from '../models/WalletSession.js';

const router = Router();

// POST /api/cryptocard/wallet/connect
router.post('/connect', async (req, res) => {
  const { id, name } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'wallet id is required' });

  // Deactivate any previous session for this wallet
  await WalletSession.updateMany({ walletId: id }, { isActive: false });

  // Generate a mock balance (replace with real web3 call later)
  const balance = (200 + Math.floor(Math.random() * 800)).toFixed(2);

  await WalletSession.create({ walletId: id, walletName: name || id, balance });

  res.json({ success: true, balance });
});

// GET /api/cryptocard/wallet/:walletId — latest session for a wallet
router.get('/:walletId', async (req, res) => {
  const session = await WalletSession
    .findOne({ walletId: req.params.walletId, isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  if (!session) return res.status(404).json({ success: false, error: 'No active session' });
  res.json({ success: true, session });
});

export default router;
