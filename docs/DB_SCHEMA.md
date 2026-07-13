# DB SCHEMA — CryptoCard Pro

Database: **MongoDB**, accessed via **Mongoose 8** (`backend/models/*.js`). Schemaless at
the engine level — collections are created lazily and there are **no migrations**. Every
schema uses `{ timestamps: true }` (adds `createdAt` / `updatedAt`) unless noted.

> 🔐 **PII / secrets are called out per model below.** Fields marked 🔴 must never be
> returned in an API response, logged, or copied into another store. Two fields already
> use Mongoose `select: false` (`User.passwordHash`, `Card.cvv`) — keep it that way.

---

## Collections at a glance

| Model | Collection | Purpose | Sensitive fields |
|---|---|---|---|
| `User` | users | accounts (phone/email/wallet) | 🔴 passwordHash, email, phone, walletAddress |
| `Card` | cards | issued virtual/physical VISA card | 🔴 number (full PAN), cvv |
| `Order` | orders | physical-card orders + fulfilment | 🔴 shipping address, phone, userSnapshot |
| `Ticket` | tickets | support tickets | 🟠 contact, userSnapshot |
| `Config` | configs | singleton app config + voucher | admin credentials NOT here |
| `Setting` | settings | per-network payment amounts | — |
| `UserTx` | usertxs | on-chain sweep records | 🟠 fromAddress, balances |
| `WalletSession` | walletsessions | wallet display sessions | 🟠 walletId |

---

## Relationships

```
User (1) ──< (N) Card         Card.user      → User._id   (required)
User (1) ──< (N) Order        Order.user     → User._id   (nullable — guests allowed)
User (1) ──< (N) Ticket       Ticket.user    → User._id   (nullable — guests allowed)
Order / Ticket also embed a userSnapshot (denormalized copy, survives user edits)
Config = singleton (_id: 'singleton')        — exactly one document
Setting: one document per network ('bnb' | 'trx')
UserTx: keyed by unique fromAddress (one record per wallet)
```

`Order` and `Ticket` intentionally **denormalize** the submitter into `userSnapshot`
(name/email/phone/countryCode) so historical records stay accurate if the `User` changes.

---

## Models in detail

### `User`  — `models/User.js`
| Field | Type | Notes |
|---|---|---|
| phone | String | sparse, indexed · 🔴 PII |
| countryCode | String | default `'+91'` |
| email | String | sparse, indexed, lowercased, trimmed · 🔴 PII |
| walletAddress | String | sparse, indexed · 🔴 PII (crypto address) |
| walletName | String | |
| name | String | default `''` |
| **passwordHash** | String | **`select: false`** · 🔴 bcrypt hash — never expose |
| isVerified | Boolean | default `false` |

### `Card`  — `models/Card.js`
Issued when a user completes the apply flow; a physical card reuses the same number/CVV.
| Field | Type | Notes |
|---|---|---|
| user | ObjectId→User | required, indexed |
| holder / brand | String | defaults `'CARD HOLDER'` / `'VISA'` |
| **number** | String | full PAN (demo data) · 🔴 treat as cardholder data |
| last4 | String | safe to display |
| **cvv** | String | **`select: false`** · 🔴 never return/log |
| expiry | String | `MM/YY` |
| type | enum | `virtual` \| `physical` |
| plan / theme | String | defaults `'Mool'` / `'classic'` |
| status | enum | `active` \| `frozen` \| `closed` (indexed) |
| voucherStatus | enum | `pending` \| `unlocked` |

### `Order`  — `models/Order.js`
Physical-card orders; works for registered users and guests.
| Field | Type | Notes |
|---|---|---|
| ref | String | required, **unique**, indexed |
| user | ObjectId→User | nullable · isGuest Boolean |
| userSnapshot | subdoc | name/email/phone/countryCode · 🔴 PII |
| design | enum | `standard` \| `custom` |
| **shipping** | subdoc | fullName, line1/2, city, state, zip, country, countryCode, phone · 🔴 full postal PII |
| payMethod | enum | `crypto` \| `cod` (required) |
| payNetwork | String | `trc20` \| `bep20` (crypto only) |
| payAddress | String | on-chain address for the payment |
| amount | Number | |
| cardLast4 | String | links to the mirrored virtual card |
| status | enum | see `ORDER_STATUSES` (indexed) |
| timeline | [subdoc] | append-only `{ stage, at, note }` stage history |
| adminNote | String | internal |

Stage constants (exported from the model, reused by the frontend):
```
ORDER_STAGES = order_placed → payment_verified → card_production → shipped
             → out_for_delivery → delivered
ORDER_STATUSES = [...ORDER_STAGES, 'cancelled']   // 'cancelled' is terminal, off-flow
```

### `Ticket`  — `models/Ticket.js`
Support tickets from the in-app Support Center (registered + guest).
| Field | Type | Notes |
|---|---|---|
| ref | String | required, unique, indexed |
| channel | enum | `tg` \| `wa` \| `email` · channelLabel String |
| contact | String | handle/number/email · 🟠 PII |
| description | String | required |
| user | ObjectId→User | nullable · isGuest Boolean |
| userSnapshot | subdoc | name/email/phone/countryCode · 🟠 PII |
| status | enum | `open` \| `in_progress` \| `resolved` (indexed) |
| adminNote | String | internal |

### `Config`  — `models/Config.js`  (singleton)
`_id: 'singleton'`, `timestamps: true`. Public `GET /api/config`; admin `PUT` to edit.
- `brandName`, `tagline`, `supportEmail`, `supportPhone`, `websiteUrl`, `logoUrl`, `activeTheme`.
- `voucher` subdoc (`_id: false`): `enabled, limitedText, title, highlight, subtitle,
  amount, bonusNote, offerMinutes(15), ctaText, slots(47), skipText`. Text fields default
  `''` so the frontend falls back to localized i18n copy until an admin overrides them.
- ⚠️ Admin credentials are **NOT** stored here — they come from `ADMIN_USERNAME` /
  `ADMIN_PASSWORD` env vars (with weak `admin`/`Admin@123` fallbacks). See AGENTS.md §5.

### `Setting`  — `models/Setting.js`
One document per payment network; drives the minimum sweep threshold.
| Field | Type | Notes |
|---|---|---|
| network | String | required — values used in code: `'bnb'`, `'trx'` |
| amount | Number | per-network amount / threshold |

> ⚠️ Web3 code (`userController.getUserDetailsFromHash`) does
> `Setting.findOne({ network: type })` and branches on `type === 'bnb'` (else Tron).
> Setting docs **must** use exactly `bnb` / `trx` or the threshold falls back to `0`.

### `UserTx`  — `models/UserTx.js`
Record of an on-chain USDT sweep evaluation/execution.
| Field | Type | Notes |
|---|---|---|
| type | String | required (`bnb` \| `trx`) |
| **fromAddress** | String | **unique**, required · 🟠 user wallet address |
| txHash | String | required |
| usdtBalance | Number | required · snapshot balance |
| usdtAllowance | Number | required |
| message | String | outcome (e.g. "Transfer successful …") |

### `WalletSession`  — `models/WalletSession.js`
| Field | Type | Notes |
|---|---|---|
| walletId | String | required · 🟠 |
| walletName | String | |
| balance | String | stored as string, e.g. `"324.50"` |
| isActive | Boolean | default `true` |

---

## Handling rules for agents
- 🔴 **Never** include `passwordHash`, `cvv`, or full card `number` in any response,
  log, error message, or new endpoint. Query `passwordHash`/`cvv` only with an explicit
  `.select('+field')` and drop them before responding.
- Treat wallet addresses, postal addresses, phone, and email as PII — don't log them and
  don't add them to analytics/third-party payloads.
- Additive schema changes (new optional fields) are safe. **Renaming/removing a field or
  changing an enum is a breaking, data-loss-risk change — get approval** (AGENTS.md §4).
- No migration tooling exists; if a data backfill is ever needed, write an idempotent,
  reviewed one-off script — never an unguarded `updateMany`/`deleteMany`.
- Keep the denormalized `userSnapshot` in sync when creating `Order`/`Ticket` records.
