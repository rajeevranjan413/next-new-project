'use client';

import { CryptoCardProvider } from './CryptoCardContext';
import WebLayout from './components/layout/WebLayout';

export default function CryptoCardPage() {
  return (
    <CryptoCardProvider>
      <WebLayout />
    </CryptoCardProvider>
  );
}
