import mongoose from 'mongoose';
import dns from 'node:dns';

// `mongodb+srv://` URIs need a DNS SRV lookup, which Node performs via c-ares
// (`dns.resolveSrv`). On many Windows/corporate setups c-ares fails to use the
// system DNS and returns `querySrv ECONNREFUSED` even when normal browsing works.
// Point the resolver at a public DNS so the SRV lookup succeeds regardless of the
// machine's configured DNS. Override with DNS_SERVERS="1.1.1.1,8.8.8.8" if needed.
const DNS_SERVERS = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',').map((s) => s.trim()).filter(Boolean);
try {
  dns.setServers(DNS_SERVERS);
} catch (err) {
  console.warn('[mongo] could not set DNS servers:', err.message);
}

// `mongodb+srv://` URIs need a DNS SRV lookup first. On networks whose DNS
// resolver refuses SRV records the driver fails with `querySrv ECONNREFUSED`
// before ever reaching MongoDB. To stay portable across machines, set
// MONGODB_URI_STANDARD to the non-SRV ("standard") connection string from Atlas
// (Connect → Drivers → older Node version). We try MONGODB_URI first, and on an
// SRV/DNS failure fall back to the standard URI automatically.
function isSrvDnsError(err) {
  const msg = err?.message || '';
  return err?.code === 'ECONNREFUSED' || /querySrv| SRV |ENOTFOUND|EAI_AGAIN/i.test(msg);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const stdUri = process.env.MONGODB_URI_STANDARD;
  if (!uri && !stdUri) throw new Error('MONGODB_URI is not set in environment');

  mongoose.connection.on('connected', () =>
    console.log(`[mongo] connected → ${mongoose.connection.name}`)
  );
  mongoose.connection.on('error', (err) =>
    console.error('[mongo] error:', err.message)
  );

  const primary = uri || stdUri;
  try {
    await mongoose.connect(primary);
  } catch (err) {
    // If the SRV lookup failed and we have a non-SRV fallback, retry with it.
    if (stdUri && primary !== stdUri && isSrvDnsError(err)) {
      console.warn(
        `[mongo] SRV/DNS lookup failed (${err.message}) — retrying with MONGODB_URI_STANDARD`
      );
      await mongoose.connect(stdUri);
      return;
    }
    throw err;
  }
}
