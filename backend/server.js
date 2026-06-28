import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter   from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import adminRouter  from './routes/admin.js';
import configRouter from './routes/config.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Static files — uploaded images ────────────────────────────────────────────
// Cross-Origin-Resource-Policy: cross-origin lets browsers on other origins
// (localhost:3000) load these files; Helmet's default is same-origin which blocks them.
app.use('/uploads',
  (_req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); },
  express.static(path.join(process.cwd(), 'public', 'uploads'))
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',              authRouter);
app.use('/api/cryptocard/wallet', walletRouter);
app.use('/api/admin',             adminRouter);
app.use('/api/config',            configRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`[server] running → http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('[server] failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
