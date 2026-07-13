# CODE STANDARDS — CryptoCard Pro

Patterns **observed in this repository**. Match them exactly; new code should be
indistinguishable from existing code. When in doubt, open a neighbouring file and mirror it.

---

## 1. Language & module system

| | Frontend | Backend |
|---|---|---|
| Modules | ESM (`import`/`export`) | **ESM** (`"type":"module"`) — never `require()` |
| Types | TS 5, `strict: false`, `allowJs: true` — feature code is mostly **`.jsx`/`.js`**, not `.tsx`. Don't convert files to TS/strict unasked. | plain `.js` |
| File extensions in imports | omit for local TS; **include `.js`/`.jsx` in the admin module** (existing convention there) | **always include `.js`** (e.g. `import User from '../models/User.js'`) — ESM requires it |

## 2. Frontend conventions

### Components
- **Function declarations**, named exports: `export function UsersPanel({ token }) { … }`.
  The page's default export is the route component (`export default function AdminPage()`).
- Any component using state/effects/handlers starts with **`'use client';`** on line 1.
- Props destructured in the signature. Callbacks named `onX` (`onNav`, `onLogout`, `onPage`).
- PascalCase components/files (`SendPanel.jsx`); camelCase hooks (`useToast.js`),
  utils, and variables.

### Styling — CSS Modules (primary)
- Import the module as **`s`**: `import s from '../admin.module.css';`
- Apply with `className={s.panel}`; conditional classes by string concat:
  `className={s.navItem + (active ? ' ' + s.navItemActive : '')}`.
- CSS class names are **camelCase**. One module per feature area (`admin.module.css`,
  `*.module.css`). Inline `style={{…}}` is used only for dynamic values (colors, widths).
- Tailwind v4 is configured globally but feature UIs here use CSS Modules — follow the
  local file's approach rather than mixing.

### Data fetching — never fetch inside a component
- All network calls live in a dedicated module: `app/admin/lib/api.js` (admin) or
  `app/cryptocard/services/api.js` (customer). Helpers are named **`api*`**.
- Standard fetch helper shape:
  ```js
  export async function apiUsers(token, { page = 1 } = {}) {
    const r = await fetch(`${API}/api/admin/users?...`, { headers: auth(token) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);   // or d.message on tx endpoints
    return d;
  }
  ```
- API base: `const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';`
- Auth header helper: `const auth = (token) => ({ Authorization: \`Bearer ${token}\` });`

### State & effects
- Local `useState`; data loaders wrapped in `useCallback` with a correct dependency array,
  then `useEffect(() => { load(); }, [load])`.
- Global customer state lives in `CryptoCardContext.jsx` (React Context), not prop-drilled.
- Memoize callbacks passed into effect deps (see `useToast`'s memoized `show`) to avoid
  infinite fetch loops.

### Shared vs. static
- Pure lookup tables (labels, colors, filters, placeholders) go in a **data-only**
  `constants.js` — no JSX there. Reusable presentational bits (`Toast`, `Avatar`,
  `Pagination`, `CopyCode`) live in `components/`.

## 3. Backend conventions

### Routers (`routes/*.js`)
- `const router = Router();` … `export default router;`. Keep routers **thin** — mount
  middleware, delegate heavy logic to `src/controllers/*`.
- Group by resource, mounted in `server.js`.

### Controllers (`src/controllers/*.js`)
- `export const doThing = async (req, res) => { try { … } catch (err) { … } }`.
- Validate inputs early and return `400` with a message before doing work.

### Async error handling — critical
- **Express 4 does not forward rejected promises.** Two patterns exist; pick per file:
  - `try/catch` inside every async handler (most controllers), **or**
  - a local `asyncHandler(fn)` wrapper (used by `routes/tickets.js`, `routes/orders.js`).
- Central `middleware/errorHandler.js` maps Mongoose `ValidationError` → 400,
  `CastError` → 400, else `err.status || 500`. Let it handle anything you `throw`.

### Response envelope (a contract the frontend depends on)
- Success: `res.json({ success: true, ...payload })` — payload keys are resource-specific
  (`users`, `data`, `order`, `ticket`, `config`, `stats`, `token`).
- Failure: `res.status(code).json({ success: false, error: 'message' })`.
  A few transaction endpoints use `message` instead of `error` — check the endpoint.
- **Do not change existing response keys** without updating the corresponding frontend
  `api*` helper.

### Auth & security patterns
- JWT via `jsonwebtoken`: `jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })`;
  admin tokens carry `{ role: 'admin' }` and are verified in `middleware/adminAuth.js`.
- Bearer tokens read from `Authorization: Bearer <t>`; `401` `Unauthorized` on missing/invalid.
- Passwords: `bcrypt.hash(password, 12)`; `passwordHash` has `select: false` — query with
  `.select('+passwordHash')` when you need it. **Never return `passwordHash` or `cvv`.**
- Middleware variants: `auth` (requires user), `adminAuth` (requires admin role),
  `optionalAuth` (attaches `req.user` if a token is present, never blocks).

### Mongoose models (`models/*.js`)
- `import { Schema, model } from 'mongoose';` → `export default model('Name', schema);`.
- Always `{ timestamps: true }`. Index lookup fields (`index: true`, `unique`, `sparse`).
- Sensitive fields use `select: false`. Enums for status/stage fields; ordered stage
  arrays exported as named consts (see `Order.js` `ORDER_STAGES`).

## 4. Logging
- Backend uses prefixed `console` tags: `[server]`, `[mongo]`, `[error]`, `[warn]`.
  Match that style; **never log secrets, tokens, private keys, or full card data.**
- Frontend surfaces errors to users via the `useToast` hook, not `console`. On an error
  message containing `"Unauthorized"`, panels call `onLogout()`.

## 5. Comments & formatting
- Comments explain **why**, not what — see the box-drawing section headers
  (`// ── Section ─────`) and the rationale comments (e.g. the CORS `||` warning in
  `server.js`, the memoization note in `useToast`). Preserve these when editing nearby.
- 2-space indentation; single quotes; trailing commas in multiline literals. Run
  `npm run lint` in `frontend/` before finishing a frontend change.

## 6. Do / Don't quick list
- ✅ Add a fetch helper to `lib/api.js` / `services/api.js`, then use it.
- ✅ Keep routers thin; put logic in controllers; keep web3 in `src/web3/`.
- ✅ Mirror the response envelope and the `{ success }` convention.
- ❌ Don't `fetch` inside a React component or import a model into the UI.
- ❌ Don't introduce a test framework, TS-strict, or a new styling system unasked.
- ❌ Don't rename existing API response keys, routes, or schema fields casually.
