# ARCHITECTURE — CryptoCard Pro

How the codebase is laid out and how a request flows from a click in the UI down to
MongoDB and the blockchain. **Golden rule: the UI layer never talks to the DB or a
chain directly — it calls the Express API, which owns all persistence and web3.**

---

## 1. Top-level map

```
next-new-project/
├── AGENTS.md                  # agent operating guide (start here)
├── docs/                      # ARCHITECTURE / CODE_STANDARDS / DB_SCHEMA
├── ecosystem.config.js        # pm2 process manifest (frontend + backend)
├── deploy/ , DEPLOY.md        # deployment assets & runbook
│
├── frontend/                  # Next.js 16 App Router app (customer UI + /admin)
│   ├── next.config.ts         # rewrites /uploads/* → backend; allowedDevOrigins
│   ├── tsconfig.json          # strict:false, allowJs:true (JS/JSX allowed)
│   ├── eslint.config.mjs      # flat config, eslint-config-next
│   └── app/
│       ├── page.*             # site root
│       ├── api/cryptocard-chat/   # Next server route (AI chat proxy) — the ONLY
│       │                          #   server code in the frontend
│       ├── cryptocard/        # the customer product (see §2)
│       └── admin/             # the admin panel (see §3)
│
└── backend/                   # Express + Mongoose API
    ├── server.js              # app bootstrap: middleware + route mounting
    ├── config/db.js           # Mongoose connect (+ SRV/DNS fallback logic)
    ├── models/                # Mongoose schemas — see docs/DB_SCHEMA.md
    ├── routes/                # thin Express routers (one per resource)
    ├── src/controllers/       # handler logic for the heavier routers
    ├── middleware/            # auth / adminAuth / optionalAuth / errorHandler
    └── src/web3/              # BSC (contract.js) + Tron (tron-utils.js) + ABIs
```

## 2. Frontend feature module: `app/cryptocard/` (customer app)

Refactored into a modular, single-responsibility structure. **Do not recreate these —
extend the right subfolder instead of growing large files.**

```
app/cryptocard/
├── page.jsx              # ~thin: <CryptoCardProvider> + <WebLayout>
├── config/               # theme.js (master theme), plans, wallets, content, i18n/
├── context/              # CryptoCardContext.jsx — global app state
├── services/api.js       # EVERY backend call the customer app makes
├── components/           # cards/, layout/, screens/, sheets/, wallet/, icons/
├── blockchain/bsc | tron # client-side chain helpers (read/connect only)
├── hooks/ , utils/ , constant/
```

## 3. Frontend feature module: `app/admin/` (admin panel)

Same modular philosophy. Adding a tab is a **one-entry change** in the registry.

```
app/admin/
├── page.jsx              # thin root: auth state + shell; renders active panel via registry
├── registry.jsx          # SINGLE SOURCE OF TRUTH: TABS[] → sidebar + content router
├── admin.module.css      # all admin styling (CSS Module)
├── lib/
│   ├── api.js            # every admin backend call (fetch helpers, API base)
│   ├── constants.js      # theme/ticket/order/voucher/network lookup tables (data only)
│   ├── format.js         # fmtDate / fmtDateTime / fmtAmt / shortMid
│   └── useToast.js       # toast hook
├── components/           # Sidebar, MobileHeader, LoginScreen, Toast, Avatar,
│                         #   CopyCode, Pagination, icons.jsx
└── panels/               # one file per tab: Overview, Users, Orders, Tickets,
                          #   Appearance, Brand, Voucher, Settings, History, Send
```

**To add an admin tab:** create `panels/MyPanel.jsx` → (optionally) add an icon in
`components/icons.jsx` → add one object to `TABS` in `registry.jsx`. Nothing else.

## 4. Backend request pipeline (`server.js`)

Global middleware order, applied to every request:

```
helmet() → cors() → rateLimit(15min/100) → [/uploads static] → express.json(16kb)
        → route routers → 404 handler → errorHandler
```

Route mount points (resource → router file):

| Mount | Router | Auth |
|---|---|---|
| `/api/auth` | `routes/auth.js` | public (issues JWT) |
| `/api/cryptocard/wallet` | `routes/wallet.js` | mixed |
| `/api/admin` | `routes/admin.js` (+ `src/controllers/adminController.js`) | `adminAuth` |
| `/api/config` | `routes/config.js` | GET public / PUT `adminAuth` |
| `/api/tickets` | `routes/tickets.js` | POST `optionalAuth` / list+update `adminAuth` |
| `/api/cryptocard/orders` | `routes/orders.js` | mixed (`optionalAuth`/`auth`/`adminAuth`) |
| `/api/cryptocard/cards` | `routes/cards.js` | `auth` / `adminAuth` |
| `/api/users` | `routes/userRoutes.js` (+ `userController.js`) | **public** (⚠ sweep trigger) |
| `/api/health` | inline | public |

## 5. End-to-end data flow (follow this layering; never short-circuit it)

### Read path (e.g. admin Users list)
```
UsersPanel.jsx (state/UI)
  → app/admin/lib/api.js  apiUsers(token)   [fetch, Bearer token]
    → GET {NEXT_PUBLIC_BACKEND_URL}/api/admin/users
      → routes/admin.js  (adminAuth middleware verifies JWT)
        → Mongoose  User.find(...).lean()
      ← { success, users, total, pages }
  ← panel renders table
```

### Write path (e.g. update a payment amount)
```
SettingsPanel.jsx onSave
  → lib/api.js  apiUpdateSetting(token, network, amount)
    → PUT /api/admin/settings  { network, amount }
      → adminAuth → adminController.updateSettings → Setting.findOneAndUpdate
      ← { success, data }
  ← optimistic local state update + toast
```

### Web3 sweep path (⚠ moves real money — see AGENTS.md §4/§5)
```
Admin "Send" (SendPanel)  OR  customer approval flow
  → POST /api/users/user-details-from-hash { type, txHash }   (PUBLIC route)
    → userController.getUserDetailsFromHash
      → reads Setting.amount (min threshold)
      → src/web3/contract.js (BSC) or tron-utils.js (Tron):
          getUserDeatilsFromHash → checks balance & allowance
          → approvedTransferToOwner → signs with OWNER_PRIVATE_KEY → on-chain tx
      → UserTx.create/update (persists fromAddress, balances, allowance, message)
    ← { success, message, data }
```

## 6. Cross-cutting rules for agents
- **New backend capability?** model (`models/`) → router (`routes/`) → mount in
  `server.js` → controller in `src/controllers/` if logic is non-trivial. Keep routers thin.
- **New customer API call?** add it to `app/cryptocard/services/api.js`, then consume
  from the context/component — components should not `fetch` inline.
- **New admin API call?** add it to `app/admin/lib/api.js`. Panels never `fetch` directly.
- **Images/uploads** are served by the backend from `public/uploads/` and proxied
  same-origin via the `next.config.ts` `/uploads/*` rewrite — don't hardcode backend URLs
  for images.
- Keep all money/chain logic in `backend/src/web3/**`. The frontend `blockchain/` folders
  are read/connect helpers only, never signing/transfer.
