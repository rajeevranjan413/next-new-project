import s from '../admin.module.css';

// Circular initial-avatar with a stable colour derived from the label.
export function Avatar({ name, email, phone }) {
  const label = name || email || phone || '?';
  const hue = [...label].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
  return <span className={s.avatar} style={{ background: `hsl(${hue},55%,48%)` }}>{label[0].toUpperCase()}</span>;
}
