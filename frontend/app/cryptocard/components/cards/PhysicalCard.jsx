'use client';

import s from '../../cryptocard.module.css';

export default function PhysicalCard() {
  return (
    /* Portrait wrapper */
    <div className={s['cd-port-wrap']}>
      {/*
        Landscape card, rotated CW 90°.
        For portrait chip at (top ≈ 12%, left ≈ 48%):
          landscape top = 100% − 48% = 52%, landscape left = 12%  (→ .cd-chip CSS)
      */}
      <div
        className={s['cd-card']}
        style={{ background: 'linear-gradient(155deg, #1c1c28 0%, #242430 55%, #1a1a24 100%)' }}
      >
        <div className={s['cd-matte']} />
        <div className={s['cd-gloss']} />

        {/* Brand — top-left of landscape (→ top-right after CW rotation) */}
        <div className={s['cd-brand-row']}>
          <svg width="32" height="32" viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
            <polygon points="13,1 24,7 24,19 13,25 2,19 2,7" fill="#F0B90B" />
            <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="rgba(0,0,0,.48)" />
          </svg>
          <span className={s['cd-brand-name']} style={{ color: '#EAECEF' }}>CryptoCard</span>
        </div>

        {/* EMV chip (positioned in landscape via .cd-chip class) */}
        <div className={s['cd-chip']}>
          <svg width="44" height="34" viewBox="0 0 44 34">
            <rect width="44" height="34" rx="5" fill="#c9a20a" />
            <rect x="0"  y="11.5" width="44" height="1.4" fill="rgba(0,0,0,.2)" />
            <rect x="0"  y="23"   width="44" height="1.4" fill="rgba(0,0,0,.2)" />
            <rect x="14.5" y="0"  width="1.4" height="34" fill="rgba(0,0,0,.2)" />
            <rect x="28"   y="0"  width="1.4" height="34" fill="rgba(0,0,0,.2)" />
            <rect x="1"  y="1"  width="12" height="9.5" rx="2" fill="#b8920a" />
            <rect x="15.9" y="1" width="11" height="9.5" rx="2" fill="#b8920a" />
            <rect x="29.4" y="1" width="13" height="9.5" rx="2" fill="#b8920a" />
            <rect x="1"  y="24" width="12" height="9"   rx="2" fill="#b8920a" />
            <rect x="15.9" y="24" width="11" height="9" rx="2" fill="#b8920a" />
            <rect x="29.4" y="24" width="13" height="9" rx="2" fill="#b8920a" />
          </svg>
        </div>

        {/* VISA — bottom-right of landscape (→ bottom-left after CW rotation) */}
        <span className={s['cd-visa']} style={{ color: '#EAECEF' }}>VISA</span>
      </div>
    </div>
  );
}
