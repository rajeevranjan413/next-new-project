import s from '../admin.module.css';

// Presentational sidebar. `items` is the nav list ({ key, label, Icon }) from
// the registry; the active panel is `nav`.
export function Sidebar({ items, nav, onNav, username, onLogout, open, onClose }) {
  return (
    <aside className={s.sidebar + (open ? ' ' + s.sidebarOpen : '')}>
      <div className={s.sidebarLogo}>
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
          <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="rgba(0,0,0,.45)" />
        </svg>
        <div className={s.sidebarBrandWrap}>
          <div className={s.sidebarBrand}>CryptoCard</div>
          <div className={s.sidebarSub}>Admin</div>
        </div>
        <button className={s.sidebarCloseBtn} onClick={onClose} aria-label="Close menu">✕</button>
      </div>

      <nav className={s.sidebarNav}>
        {items.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={s.navItem + (nav === key ? ' ' + s.navItemActive : '')}
            onClick={() => { onNav(key); onClose(); }}
          >
            <span className={s.navIcon}><Icon /></span>
            <span className={s.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      <div className={s.sidebarFooter}>
        <div className={s.sfUser}>
          <span className={s.sfAvatar}>{username[0]?.toUpperCase()}</span>
          <span className={s.sfName}>{username}</span>
        </div>
        <button className={s.sfLogout} onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}
