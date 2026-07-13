import s from '../admin.module.css';

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className={s.toast}>{msg}</div>;
}
