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

// Filenames for the connect-wallet button logo (kept distinct from the brand logo).
const payLogoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req,  file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `paylogo_${Date.now()}${ext}`);
  },
});
const payLogoUpload = multer({
  storage: payLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Turn any absolute http URL into a root-relative /uploads path so the frontend
// never hardcodes the backend host. Handles the brand logo and the pay-button logo.
function toRelative(url) {
  if (url?.startsWith('http')) {
    try { return new URL(url).pathname; } catch { /* keep */ }
  }
  return url;
}

// Normalize logoUrl: old records stored absolute http URLs; always return
// a root-relative path so the frontend doesn't hardcode the backend host.
function normalizeLogo(cfg) {
  if (cfg?.logoUrl) cfg.logoUrl = toRelative(cfg.logoUrl);
  if (cfg?.payment?.connectWallet?.logoUrl) {
    cfg.payment.connectWallet.logoUrl = toRelative(cfg.payment.connectWallet.logoUrl);
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

// Whitelist + sanitize the payment payload (wallet addresses + connect-wallet button).
// Returns undefined when the key is absent so unrelated saves don't touch it. The
// button's logoUrl is intentionally NOT settable here — it's managed by /pay-logo —
// so a text save can never wipe an uploaded logo.
function cleanPayment(p) {
  if (!p || typeof p !== 'object') return undefined;
  const str = (x, max = 200) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
  const cw = p.connectWallet || {};
  return {
    walletTron: str(p.walletTron, 120),
    walletBnb:  str(p.walletBnb, 120),
    connectWallet: {
      enabled: cw.enabled === true,
      text:    str(cw.text, 60),
      url:     str(cw.url, 500),
    },
  };
}

// ── PUT /api/config — update text fields (admin) ──────────────────────────────
router.put('/', adminAuth, async (req, res) => {
  const { brandName, tagline, supportEmail, supportPhone, websiteUrl, activeTheme, payment, voucher } = req.body;
  const cleanedVoucher = cleanVoucher(voucher);
  const cleanedPayment = cleanPayment(payment);

  // Merge the connect-wallet block so a text save keeps the separately-uploaded logo.
  // The logo is normally managed by /pay-logo, so a text save omits logoUrl and we
  // preserve it — but an explicit string (e.g. '' to clear) is honored.
  let paymentSet;
  if (cleanedPayment) {
    const existing = await Config.findById('singleton').select('payment').lean();
    const rawLogo = payment?.connectWallet?.logoUrl;
    paymentSet = {
      walletTron: cleanedPayment.walletTron,
      walletBnb:  cleanedPayment.walletBnb,
      connectWallet: {
        ...cleanedPayment.connectWallet,
        logoUrl: typeof rawLogo === 'string'
          ? rawLogo.trim().slice(0, 300)
          : (existing?.payment?.connectWallet?.logoUrl || ''),
      },
    };
  }

  const cfg = await Config.findByIdAndUpdate(
    'singleton',
    { $set: {
        brandName, tagline, supportEmail, supportPhone, websiteUrl,
        ...(activeTheme && { activeTheme }),
        ...(paymentSet && { payment: paymentSet }),
        ...(cleanedVoucher && { voucher: cleanedVoucher }),
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  res.json({ success: true, config: normalizeLogo(cfg) });
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

// ── POST /api/config/pay-logo — upload the connect-wallet button logo (admin) ──
router.post('/pay-logo', adminAuth, payLogoUpload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

  const logoUrl = `/uploads/${req.file.filename}`;

  // Remove the previous pay-logo file if one was set.
  const old = await Config.findById('singleton').select('payment').lean();
  const oldUrl = old?.payment?.connectWallet?.logoUrl;
  if (oldUrl) {
    const oldFile = path.join(UPLOADS_DIR, path.basename(oldUrl));
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  const cfg = await Config.findByIdAndUpdate(
    'singleton',
    { $set: { 'payment.connectWallet.logoUrl': logoUrl } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  res.json({ success: true, config: normalizeLogo(cfg), logoUrl });
});

export default router;
