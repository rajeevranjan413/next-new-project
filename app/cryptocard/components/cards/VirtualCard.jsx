'use client';

import s from '../../cryptocard.module.css';

export default function VirtualCard({ theme }) {
  const bgStyle = theme.bgImage
    ? { backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: theme.bg };

  return (
    /* Portrait wrapper — reserves the portrait space in layout */
    <div className={s['cd-port-wrap']}>
      {/*
        Landscape card: built naturally wide (1.586:1), then rotate(90deg) CW.
        Everything inside uses normal horizontal layout.
        After rotation:  top-left → top-right  |  bottom-right → bottom-left
      */}
      <div className={s['cd-card']} style={bgStyle}>
        <div className={s['cd-gloss']} />

        {/* Brand — top-left of landscape (→ top-right after CW rotation) */}
        <div className={s['cd-brand-row']}>
          {/* Hexagon icon */}
          <svg width="32" height="32" viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
            <polygon points="13,1 24,7 24,19 13,25 2,19 2,7" fill={theme.accent} />
            <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="rgba(0,0,0,.48)" />
          </svg>
          <span className={s['cd-brand-name']} style={{ color: theme.text }}>CryptoCard</span>
        </div>

        {/* VISA — bottom-right of landscape (→ bottom-left after CW rotation) */}
        <span className={s['cd-visa']} style={{ color: theme.text }}>VISA</span>
      </div>
    </div>
  );
}
