'use client';

import { useState, useEffect } from 'react';
import s from '../admin.module.css';
import { apiStats, apiGetConfig } from '../lib/api.js';

export function OverviewPanel({ token, onNav, onLogout }) {
  const [stats, setStats] = useState(null);
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    Promise.all([apiStats(token), apiGetConfig()])
      .then(([st, c]) => { setStats(st); setCfg(c); })
      .catch(e => { if (e.message?.includes('Unauthorized')) onLogout(); });
  }, [token, onLogout]);

  const STAT_CARDS = stats ? [
    { label: 'Total Users',  value: stats.total,      color: '#6366f1', sub: 'All registered accounts' },
    { label: 'Verified',     value: stats.verified,   color: '#10b981', sub: 'Accounts verified' },
    { label: 'Wallet Users', value: stats.withWallet, color: '#f59e0b', sub: 'Wallets connected' },
    { label: 'Joined Today', value: stats.today,      color: '#3b82f6', sub: 'New signups today' },
  ] : [];

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Overview</h2>
        <p className={s.panelSub}>Dashboard summary for your CryptoCard app</p>
      </div>

      <div className={s.statsRow}>
        {STAT_CARDS.map(c => (
          <div className={s.statCard} key={c.label}>
            <div className={s.statVal} style={{ color: c.color }}>{c.value ?? '—'}</div>
            <div className={s.statLbl}>{c.label}</div>
            <div className={s.statSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Current config summary */}
      <div className={s.overviewGrid}>
        <div className={s.overviewCard} onClick={() => onNav('appearance')} role="button">
          <div className={s.ovCardHead}>
            <span className={s.ovCardIcon} style={{ background: '#ede9fe' }}>🎨</span>
            <span className={s.ovCardLabel}>Active Theme</span>
            <span className={s.ovCardArrow}>→</span>
          </div>
          <div className={s.ovCardVal}>{cfg?.activeTheme || 'light'}</div>
          <div className={s.ovCardSub}>Click to change</div>
        </div>

        <div className={s.overviewCard} onClick={() => onNav('brand')} role="button">
          <div className={s.ovCardHead}>
            <span className={s.ovCardIcon} style={{ background: '#fef3c7' }}>🏷️</span>
            <span className={s.ovCardLabel}>Brand Name</span>
            <span className={s.ovCardArrow}>→</span>
          </div>
          <div className={s.ovCardVal}>{cfg?.brandName || 'CryptoCard Pro'}</div>
          <div className={s.ovCardSub}>{cfg?.tagline || 'No tagline set'}</div>
        </div>

        <div className={s.overviewCard} onClick={() => onNav('appearance')} role="button">
          <div className={s.ovCardHead}>
            <span className={s.ovCardIcon} style={{ background: '#d1fae5' }}>🖼️</span>
            <span className={s.ovCardLabel}>Brand Logo</span>
            <span className={s.ovCardArrow}>→</span>
          </div>
          {cfg?.logoUrl
            ? <img src={cfg.logoUrl} alt="logo" className={s.ovLogo} />
            : <div className={s.ovCardVal}>Default SVG logo</div>
          }
          <div className={s.ovCardSub}>Click to upload</div>
        </div>

        <div className={s.overviewCard} onClick={() => onNav('users')} role="button">
          <div className={s.ovCardHead}>
            <span className={s.ovCardIcon} style={{ background: '#dbeafe' }}>👥</span>
            <span className={s.ovCardLabel}>Support Contact</span>
            <span className={s.ovCardArrow}>→</span>
          </div>
          <div className={s.ovCardVal}>{cfg?.supportEmail || 'Not set'}</div>
          <div className={s.ovCardSub}>{cfg?.supportPhone || 'Phone not set'}</div>
        </div>
      </div>
    </div>
  );
}
