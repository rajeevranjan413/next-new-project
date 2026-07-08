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

// Whitelist + sanitize the voucher payload so the admin can't persist junk.
function cleanVoucher(v) {
  if (!v || typeof v !== 'object') return undefined;
  const str = (x, max = 300) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
  const num = (x, def, min, max) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : def;
  };
  return {
    enabled:      v.enabled !== false,
    limitedText:  str(v.limitedText, 80),
    title:        str(v.title, 120),
    highlight:    str(v.highlight, 120),
    subtitle:     str(v.subtitle),
    amount:       str(v.amount, 40),
    bonusNote:    str(v.bonusNote),
    offerMinutes: num(v.offerMinutes, 15, 1, 240),
    ctaText:      str(v.ctaText, 120),
    slots:        num(v.slots, 47, 0, 100000),
    skipText:     str(v.skipText, 120),
  };
}

// ── PUT /api/config — update text fields (admin) ──────────────────────────────
router.put('/', adminAuth, async (req, res) => {
  const { brandName, tagline, supportEmail, supportPhone, websiteUrl, activeTheme, voucher } = req.body;
  const cleanedVoucher = cleanVoucher(voucher);

  const cfg = await Config.findByIdAndUpdate(
    'singleton',
    { $set: {
        brandName, tagline, supportEmail, supportPhone, websiteUrl,
        ...(activeTheme && { activeTheme }),
        ...(cleanedVoucher && { voucher: cleanedVoucher }),
    } },
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
