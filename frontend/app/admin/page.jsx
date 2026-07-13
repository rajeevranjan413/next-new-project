'use client';

import { useState, useEffect } from 'react';
import s from './admin.module.css';
import { NAV_ITEMS, TAB_BY_KEY } from './registry.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { MobileHeader } from './components/MobileHeader.jsx';
import { LoginScreen } from './components/LoginScreen.jsx';

// Root: holds auth + which-tab state, renders the shell, and delegates the active
// tab to its panel via the registry. All tab wiring lives in ./registry.jsx.
export default function AdminPage() {
  const [token, setToken]         = useState(null);
  const [username, setUsername]   = useState('');
  const [nav, setNav]             = useState('overview');
  const [sidebarOpen, setSidebar] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem('admin_token');
    const u = sessionStorage.getItem('admin_user');
    if (t) { setToken(t); setUsername(u || 'admin'); }
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebar(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function handleLogin(t, u) {
    sessionStorage.setItem('admin_token', t);
    sessionStorage.setItem('admin_user', u);
    setToken(t); setUsername(u);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    setToken(null); setUsername('');
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const active = TAB_BY_KEY[nav] || TAB_BY_KEY.overview;
  const Panel = active.Component;

  return (
    <div className={s.shell}>
      {/* Mobile header — hidden on desktop via CSS */}
      <MobileHeader username={username} onMenuOpen={() => setSidebar(true)} onLogout={handleLogout} />

      {/* Overlay — mobile only */}
      {sidebarOpen && (
        <div className={s.sidebarOverlay} onClick={() => setSidebar(false)} />
      )}

      <Sidebar
        items={NAV_ITEMS}
        nav={nav}
        onNav={setNav}
        username={username}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebar(false)}
      />

      <div className={s.content}>
        <Panel token={token} onNav={setNav} onLogout={handleLogout} {...(active.props || {})} />
      </div>
    </div>
  );
}
