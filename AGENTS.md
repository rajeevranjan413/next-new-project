# AGENTS.md — CryptoCard Pro

Operating guide for AI coding agents working in this repository. Read this first.
Deep-dive docs live in [`docs/`](docs/): [ARCHITECTURE](docs/ARCHITECTURE.md) ·
[CODE_STANDARDS](docs/CODE_STANDARDS.md) · [DB_SCHEMA](docs/DB_SCHEMA.md).

> ⚠️ **There is also a `frontend/AGENTS.md`.** It states the Next.js version here has
> breaking changes vs. training data — **read `frontend/node_modules/next/dist/docs/`
> for the relevant API before writing frontend code.** That instruction still applies.

---

## 1. What this project is

**CryptoCard Pro** — a crypto payment-card web app. Users sign up (phone / email /
crypto wallet), are issued a virtual VISA card, can order a physical card with a
fulfilment timeline, connect BSC/Tron wallets, and receive a welcome-voucher bonus.
An admin panel manages users, orders, support tickets, branding/theme, the voucher
popup, per-network payment amounts, and **on-chain USDT collection** ("sweeps") from
approved user wallets into an owner wallet.

This is a **two-app monorepo**, not a single package. There is no root `package.json`.

```
frontend/   Next.js 16 App Router UI (the whole customer app + /admin)
backend/    Express + MongoDB REST API + web3 (BSC & Tron) fund-sweep layer
deploy/     deployment assets   ·   ecosystem.config.js = pm2 process manifest
docs/       these agent docs
```

## 2. Exact stack

### Frontend (`frontend/`)
| Concern | Choice |
|---|---|
| Framework | **Next.js 16.2.9**, App Router, **Turbopack** |
| React | **19.2.4** |
| Language | TypeScript 5 with `strict: false`, `allowJs: true` — **most feature code is `.jsx`/`.js`, not `.tsx`** |
| Styling | **CSS Modules** (`*.module.css`, imported as `s`) for components; **Tailwind v4** (`@tailwindcss/postcss`) available globally |
| Wallet | `@reown/appkit` + `-adapter-ethers` (BSC) + `-adapter-tron` (Tron) |
| Other libs | `antd` 6, `lucide-react`, `qrcode` |
| Dev port | **3001** (`next dev -p 3001`) |

### Backend (`backend/`)
| Concern | Choice |
|---|---|
| Runtime | Node.js, **ESM** (`"type": "module"` — use `import`, never `require`) |
| Framework | **Express 4.21** |
| DB / ODM | **MongoDB** via **Mongoose 8.9** (schema-per-file, no SQL, no migrations) |
| Auth | **JWT** (`jsonwebtoken`) bearer tokens + `bcryptjs` (cost 12) |
| Security mw | `helmet`, `express-rate-limit`, `cors`, `multer` (logo uploads) |
| Web3 | `web3` 4.16 (BSC / BEP-20 USDT), `tronweb` 6.4 (Tron / TRC-20 USDT) |
| Port | **4000** |

**Testing:** there is **no test framework** in either app. Do not assume `jest`/`vitest`
exist. "Verify" means: typecheck/build the frontend and manually exercise the flow.

## 3. Standard commands

Run these **inside the relevant app directory** — there is no root task runner.

```bash
# Frontend
cd frontend
npm install
npm run dev            # dev server on http://localhost:3001 (Turbopack)
npm run build          # production build — RUN THIS to verify a frontend change compiles
npm run lint           # eslint (flat config, eslint-config-next)

# Backend
cd backend
npm install
cp .env.example .env   # then fill in real values (see §5)
npm run dev            # node --watch server.js  (auto-restart)
npm start              # node server.js
curl localhost:4000/api/health   # smoke test

# Process management (production)
pm2 start ecosystem.config.js
```

There are **no DB migrations** — Mongoose creates collections lazily. Never write a
"migration script" that drops or renames collections without explicit approval.

## 4. Autonomy boundaries

### ✅ Do autonomously
- Add/modify UI panels, components, screens, hooks, styles within `frontend/app/**`.
- Add API routes, controllers, middleware, and Mongoose models in `backend/**`.
- Add fields to a Mongoose schema (additive, backward-compatible).
- Read code, run `npm run build` / `npm run lint`, run the dev servers.
- Update these `docs/` files and code comments.

### 🟡 Ask first
- Adding a new npm dependency (bundle size / supply chain) to either app.
- Changing auth, JWT handling, password hashing, or the admin-login mechanism.
- Anything touching `backend/src/web3/**` (money movement — see §5).
- Changing CORS, `helmet`, rate-limit, or `next.config.ts` security settings.
- Removing or renaming existing schema fields (data-loss risk) or existing API routes
  (frontend contracts depend on them).
- Editing `ecosystem.config.js`, `deploy/**`, or `DEPLOY.md`.

### ⛔ Never do without an explicit, specific instruction
- **Never commit secrets.** Never add real keys, `.env`, or private keys to git.
- **Never touch, print, or exfiltrate `backend/.env`** or any real credential.
- **Never run destructive DB operations** (`dropDatabase`, `deleteMany({})`,
  collection drops) against any environment.
- **Never trigger a live fund sweep** — do not call the sweep code paths
  (`approvedTransferToOwner`, `POST /api/users/user-details-from-hash`) against
  mainnet from a dev box. These move real USDT.
- Never run `git push`, force-push, or history rewrites unless asked.
- Never weaken security (disable auth, widen CORS, log secrets) to "make it work."

## 5. Known security landmines (flag, don't silently fix — but never make worse)

The audit found live risks. Treat them as **do-not-worsen** and surface them:

1. **Hardcoded owner private key.** `backend/src/web3/contract.js` contains a literal
   `OWNER_PRIVATE_KEY`, owner address, and contract addresses in source. This is a real
   secret in version control that controls fund movement. Do not copy it elsewhere, do
   not log it. If asked to work here, recommend moving it to env + rotating the key.
2. **CORS is wide open.** `server.js` uses `app.use(cors())`; the restrictive
   allow-list is commented out. `next.config.ts` `allowedDevOrigins` includes `'*'`.
3. **Weak fallback credentials.** `ADMIN_USERNAME`/`ADMIN_PASSWORD` default to
   `admin` / `Admin@123` and `JWT_SECRET` has a dev fallback string when env is unset.
4. **Full PAN + CVV** are stored on the `Card` model (demo data, but treat as sensitive).

Environment variables the backend expects (see `backend/.env.example`):
`PORT, MONGODB_URI (+ optional MONGODB_URI_STANDARD, DNS_SERVERS), FRONTEND_URL,
JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD`. Frontend uses `NEXT_PUBLIC_BACKEND_URL`
and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

## 6. Gotchas verified in this codebase
- **MongoDB Atlas is IP-whitelisted.** Dev machines are often blocked, so DB-backed
  paths can't always be exercised locally — verify against a whitelisted network.
- **Express 4 doesn't forward async errors.** Newer routers (`tickets`, `orders`) wrap
  handlers in a local `asyncHandler`; follow that pattern in new async routes.
- **Restart the backend after adding routes** — `node server.js` (pm2/`--watch`), not
  hot-reloaded for route registration in all setups.
- **API response shape is a contract:** success → `{ success: true, ... }`; error →
  `{ success: false, error }` (some transaction endpoints use `message`). The frontend
  keys logout on an error message containing `"Unauthorized"`.
- A near-empty stray `package-lock.json` sits at the repo root and triggers a Next
  "multiple lockfiles" warning; the real lockfiles are in `frontend/` and `backend/`.
