// Server component — fetches config at request time, no client-side flicker
import { CryptoCardProvider } from './CryptoCardContext';
import WebLayout from './components/layout/WebLayout';

const DEFAULT_VOUCHER = {
  enabled: true, limitedText: '', title: '', highlight: '', subtitle: '',
  amount: '', bonusNote: '', offerMinutes: 15, ctaText: '', slots: 47, skipText: '',
};

const DEFAULT_PAYMENT = {
  walletTron: '', walletBnb: '',
  connectWallet: { enabled: false, text: '', logoUrl: '', url: '' },
};

const DEFAULT_CONFIG = {
  brandName: 'CryptoCard Pro',
  tagline: 'Pay with Crypto, Anywhere in the World',
  logoUrl: '',
  supportEmail: '',
  supportPhone: '',
  websiteUrl: '',
  activeTheme: 'light',
  payment: DEFAULT_PAYMENT,
  voucher: DEFAULT_VOUCHER,
};

async function getConfig() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/config`,
      { next: { revalidate: 30 } }   // ISR: re-fetch in background every 30 s
    );
    if (!res.ok) return DEFAULT_CONFIG;
    const { config } = await res.json();
    // Deep-merge nested blocks so a partial/legacy record can't drop fields.
    return {
      ...DEFAULT_CONFIG, ...config,
      payment: {
        ...DEFAULT_PAYMENT, ...(config?.payment || {}),
        connectWallet: { ...DEFAULT_PAYMENT.connectWallet, ...(config?.payment?.connectWallet || {}) },
      },
      voucher: { ...DEFAULT_VOUCHER, ...(config?.voucher || {}) },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export default async function CryptoCardPage() {
  const initialConfig = await getConfig();
  return (
    <>
      {initialConfig.logoUrl && (
        <link rel="preload" as="image" href={initialConfig.logoUrl} />
      )}
      <CryptoCardProvider initialConfig={initialConfig}>
        <WebLayout />
      </CryptoCardProvider>
    </>
  );
}
