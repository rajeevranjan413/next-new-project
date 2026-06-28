'use client';

import { Bell, User } from 'lucide-react';
import { useCryptoCard } from '../CryptoCardContext';
import s from '../cryptocard.module.css';

export default function TopHeader() {
  const { openSheet, goScreen, appConfig } = useCryptoCard();
  const brandName = appConfig?.brandName || 'CryptoCard Pro';
  return (
    <div className={s['top-hdr']}>
      <button className={s['th-logo']} onClick={() => goScreen('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        {appConfig?.logoUrl ? (
          <img src={appConfig.logoUrl} alt={brandName} style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 4 }} />
        ) : (
          <svg width="26" height="26" viewBox="0 0 20 20" aria-hidden="true">
            <polygon points="10,1 19,6.5 19,13.5 10,19 1,13.5 1,6.5" fill="#F0B90B" />
            <polygon points="10,5.5 15.5,8.8 15.5,11.2 10,14.5 4.5,11.2 4.5,8.8" fill="#0B0E11" />
          </svg>
        )}
        {brandName}
      </button>
      <div className={s['th-right']}>
        <button className={s['th-btn']} onClick={() => openSheet('support')}>
          <Bell size={18} strokeWidth={2} />
          <div className={s.bdot} />
        </button>
        <button className={s['th-btn']} onClick={() => goScreen('profile')}>
          <User size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
