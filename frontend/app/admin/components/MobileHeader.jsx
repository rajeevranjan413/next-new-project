import s from '../admin.module.css';

// Top bar shown only on mobile (hidden on desktop via CSS); opens the sidebar.
export function MobileHeader({ username, onMenuOpen, onLogout }) {
  return (
    <header className={s.mobileHeader}>
      <button className={s.hamburger} onClick={onMenuOpen} aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="2" y="4"  width="16" height="2" rx="1"/>
          <rect x="2" y="9"  width="16" height="2" rx="1"/>
          <rect x="2" y="14" width="16" height="2" rx="1"/>
        </svg>
      </button>
      <div className={s.mobileHeaderBrand}>
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B"/>
          <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="rgba(0,0,0,.45)"/>
        </svg>
        <span>CryptoCard <strong>Admin</strong></span>
      </div>
      <button className={s.mobileLogout} onClick={onLogout}>Logout</button>
    </header>
  );
}
