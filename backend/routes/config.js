import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Config from '../models/Config.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// ── Multer — store logo in public/uploads/ ───────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req,  file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Normalize logoUrl: old records stored absolute http URLs; always return
// a root-relative path so the frontend doesn't hardcode the backend host.
function normalizeLogo(cfg) {
  if (cfg?.logoUrl?.startsWith('http')) {
    try { cfg.logoUrl = new URL(cfg.logoUrl).pathname; } catch { /* keep */ }
  }
  return cfg;
}

// ── GET /api/config — public ──────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  const cfg = normalizeLogo(await Config.findById('singleton').lean() || {});
  res.json({ success: true, config: cfg });
});

// ── PUT /api/config — update text fields (admin) ──────────────────────────────
router.put('/', adminAuth, async (req, res) => {
  const { brandName, tagline, supportEmail, supportPhone, websiteUrl, activeTheme } = req.body;

  const cfg = await Config.findByIdAndUpdate(
    'singleton',
    { $set: { brandName, tagline, supportEmail, supportPhone, websiteUrl, ...(activeTheme && { activeTheme }) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  res.json({ success: true, config: cfg });
});

// ── POST /api/config/logo — upload brand logo (admin) ────────────────────────
router.post('/logo', adminAuth, upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

  // Store root-relative path only — no host/port, works across all environments.
  const logoUrl = `/uploads/${req.file.filename}`;

  // Delete old logo file if present
  const old = normalizeLogo(await Config.findById('singleton').lean());
  if (old?.logoUrl) {
    const oldFile = path.join(UPLOADS_DIR, path.basename(old.logoUrl));
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  const cfg = await Config.findByIdAndUpdate(
    'singleton',
    { $set: { logoUrl } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  res.json({ success: true, config: cfg, logoUrl });
});

export default router;
