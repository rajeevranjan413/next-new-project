// PM2 process definitions for CryptoCard Pro.
//
//   Backend  (Express API) → port 9001
//   Frontend (Next.js)     → port 9000
//
// Start both:   pm2 start ecosystem.config.js
// See DEPLOY.md in this folder for the full first-time setup (install + build).
//
// IMPORTANT — read before you deploy:
//   • The frontend talks to the backend from the *browser* via
//     NEXT_PUBLIC_BACKEND_URL. Next.js inlines that value at BUILD time, so it
//     must be set when you run `next build` (not just here at runtime). Point it
//     at the backend's public address, e.g. http://<SERVER_IP>:9001
//   • The backend's CORS whitelist only allows FRONTEND_URL + localhost. Set
//     FRONTEND_URL below to the browser-facing frontend origin, e.g.
//     http://<SERVER_IP>:9000  — otherwise the browser's API calls are blocked.
//   • Secrets (MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, …) stay in backend/.env,
//     which server.js loads via dotenv. Don't put them in this committed file.

module.exports = {
  apps: [
    {
      name: 'trusted-card.xyz-backend',
      cwd: './backend',
      script: 'server.js',            // ESM entry; loads backend/.env via dotenv
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
        // Browser-facing frontend origin — must match how users reach the site.
        // Behind Nginx on the domain this is the https origin (no port).
        FRONTEND_URL: 'https://trusted-card.xyz',
      },
    },
    {
      name: 'trusted-card.xyz-frontend',
      cwd: './frontend',
      // Call the Next.js binary directly so PM2 manages the node process itself
      // (more reliable than wrapping `npm start`). Requires `next build` first.
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 9001',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
      },
    },
  ],
};
