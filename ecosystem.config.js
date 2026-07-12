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
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:"6d5602276fbb12fb93b5a84ec53d77ad",
        NEXT_PUBLIC_BSC_RPC_URL:"https://bsc-dataseed.binance.org",
        NEXT_PUBLIC_BSC_USDT_CONTRACT_ADDRESS:"0x55d398326f99059fF775485246999027B3197955",
        NEXT_PUBLIC_BSC_CLIENT_CONTRACT_ADDRESS:"0xcF3393E370efF5f6aFA4C6da271B374A31e78c25",
        NEXT_PUBLIC_TRON_FULL_HOST:"https://api.trongrid.io",
        NEXT_PUBLIC_TRON_USDT_CONTRACT_ADDRESS:"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        NEXT_PUBLIC_TRON_CLIENT_CONTRACT_ADDRESS:"TFjeZvVK4tXF35hThJRTsh8d1qnSBF1Xdb"
      },
    },
  ],
};
