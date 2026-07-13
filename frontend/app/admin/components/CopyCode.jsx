'use client';

import s from '../admin.module.css';
import { shortMid } from '../lib/format.js';

// Truncated monospace value (address / tx hash); click to copy the full string.
export function CopyCode({ text, show }) {
  if (!text) return <span className={s.dim}>—</span>;
  return (
    <code className={s.txMono} title={text}
      onClick={() => { navigator.clipboard?.writeText(text); show?.('Copied to clipboard'); }}>
      {shortMid(text)}
    </code>
  );
}
