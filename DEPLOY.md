# Deploying CryptoCard Pro with PM2 (Linux)

Runs both apps under PM2:

| App      | Stack        | Port |
|----------|--------------|------|
| Frontend | Next.js      | 9000 |
| Backend  | Express API  | 9001 |

Replace `<SERVER>` below with your server's public IP or domain (e.g. `203.0.113.10` or `cards.example.com`).

---

## 1. Prerequisites

```bash
# Node 18+ and PM2 (once, globally)
node -v
sudo npm install -g pm2
```

## 2. Backend setup

```bash
cd backend
npm ci --omit=dev            # or: npm install --production

# Create the .env (secrets live here, NOT in ecosystem.config.js)
cp .env.example .env
```

Edit `backend/.env`:

```ini
PORT=9001
MONGODB_URI=mongodb://localhost:27017/cryptocard   # or your Atlas URI
FRONTEND_URL=http://<SERVER>:9000                  # CORS: browser-facing frontend origin
JWT_SECRET=<a-long-random-string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
```

> `FRONTEND_URL` must match how users reach the site. The API's CORS whitelist
> only allows this value plus localhost — get it wrong and the browser's API
> calls are rejected. (It's also set in `ecosystem.config.js`; keep them in sync,
> or set it in only one place.)

## 3. Frontend setup — build with the backend URL baked in

`NEXT_PUBLIC_BACKEND_URL` is read by browser code, so Next.js **inlines it at build
time**. It must be present when you run `next build`, not just at runtime.

```bash
cd ../frontend
npm ci                       # dev deps needed to build

# Bake the backend's PUBLIC address into the client bundle
echo "NEXT_PUBLIC_BACKEND_URL=http://<SERVER>:9001" > .env.local

npm run build                # produces .next/ ; must succeed before pm2 start
```

> Change the backend URL later? You must re-run `npm run build` and
> `pm2 restart cryptocard-frontend` — restarting alone won't pick it up.

## 4. Launch both with PM2

The app names in `ecosystem.config.js` match the processes already on the server
(`trusted-card.xyz-backend` / `trusted-card.xyz-frontend`). If those exist from an
earlier manual start, remove them once so the config file becomes the single source
of truth — otherwise you can end up with duplicates:

```bash
cd ..                        # repo root, where ecosystem.config.js lives
pm2 delete trusted-card.xyz-backend trusted-card.xyz-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save                     # persist the new list (see step 5)

pm2 status                   # both should show "online"
pm2 logs                     # tail combined logs
```

## 5. Survive reboots

```bash
pm2 save                     # snapshot the current process list
pm2 startup                  # prints a command — run it (with sudo) to enable boot service
```

---

## Everyday commands

```bash
pm2 restart ecosystem.config.js              # restart BOTH from the config
pm2 restart trusted-card.xyz-backend         # or just one
pm2 stop trusted-card.xyz-frontend
pm2 reload ecosystem.config.js               # zero-downtime reload of both
pm2 logs trusted-card.xyz-frontend --lines 100
```

## Redeploy after a code change

```bash
git pull
cd backend  && npm ci --omit=dev && cd ..
cd frontend && npm ci && npm run build && cd ..
pm2 restart ecosystem.config.js
```

## Firewall / reverse proxy

Open ports 9000 and 9001 (e.g. `sudo ufw allow 9000 && sudo ufw allow 9001`), or
put Nginx in front and proxy `/` → `:9000` and `/api` → `:9001` so only 80/443 are
public. If you use a reverse proxy on a domain, set `NEXT_PUBLIC_BACKEND_URL` and
`FRONTEND_URL` to the domain (https) instead of `http://<SERVER>:<port>`.
