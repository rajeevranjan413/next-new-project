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
import ticketsRouter from './routes/tickets.js';
import ordersRouter  from './routes/orders.js';
import cardsRouter   from './routes/cards.js';
import userRoutes from './routes/userRoutes.js';

const app  = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// ── Security ─────────────────────────────────────────────────────────────────
// Allow the configured frontend URL plus common local dev ports. Next.js falls
// back to 3001 when 3000 is taken, so both are whitelisted in development.
// NOTE: `cors` origin needs a single string, an array, or a function — a
// `||` chain silently only ever picks the first truthy value.
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(helmet());
// app.use(cors({
//   origin: ALLOWED_ORIGINS,
//   credentials: true,
// }));
app.use(cors());
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
app.use('/api/tickets',           ticketsRouter);
app.use('/api/cryptocard/orders', ordersRouter);
app.use('/api/cryptocard/cards',  cardsRouter);
app.use('/api/users',  userRoutes);

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
