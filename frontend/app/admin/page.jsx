'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import s from './admin.module.css';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const THEME_REGISTRY = [
  { key: 'light',    label: 'Light',    desc: 'White · grey · minimal',   bg: '#FFFFFF', surface: '#F9FAFB', accent: '#111827', text: '#111827' },
  { key: 'white',    label: 'White',    desc: 'Clean light with gold',     bg: '#FFFFFF', surface: '#F5F5F7', accent: '#C8860A', text: '#0B0E11' },
  { key: 'dark',     label: 'Dark',     desc: 'BNB-style dark',            bg: '#0B0E11', surface: '#1E2329', accent: '#F0B90B', text: '#EAECEF' },
  { key: 'charcoal', label: 'Charcoal', desc: 'iOS-style warm dark',       bg: '#1C1C1E', surface: '#2C2C2E', accent: '#F0B90B', text: '#F2F2F7' },
  { key: 'midnight', label: 'Midnight', desc: 'Pure black AMOLED',         bg: '#000000', surface: '#111111', accent: '#F0B90B', text: '#FFFFFF'  },
  { key: 'obsidian', label: 'Obsidian', desc: 'Deep blue-black galaxy',    bg: '#0D0D15', surface: '#13131E', accent: '#F0B90B', text: '#E8E8F0' },
];

// ── API helpers ───────────────────────────────────────────────────────────────
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const json = { 'Content-Type': 'application/json' };

async function apiLogin(username, password) {
  const r = await fetch(`${API}/api/admin/login`, { method: 'POST', headers: json, body: JSON.stringify({ username, password }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Login failed'); return d;
}
async function apiStats(token) {
  const r = await fetch(`${API}/api/admin/stats`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.stats;
}
async function apiUsers(token, { page = 1, search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20, search });
  const r = await fetch(`${API}/api/admin/users?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
async function apiGetConfig() {
  const r = await fetch(`${API}/api/config`);
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.config || {};
}
async function apiSaveConfig(token, fields) {
  const r = await fetch(`${API}/api/config`, { method: 'PUT', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.config;
}
async function apiUploadLogo(token, file) {
  const fd = new FormData(); fd.append('logo', file);
  const r = await fetch(`${API}/api/config/logo`, { method: 'POST', headers: auth(token), body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function Avatar({ name, email, phone }) {
  const label = name || email || phone || '?';
  const hue = [...label].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
  return <span className={s.avatar} style={{ background: `hsl(${hue},55%,48%)` }}>{label[0].toUpperCase()}</span>;
}
function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3200); };
  return [msg, show];
}

// ── Sidebar icons ─────────────────────────────────────────────────────────────
const Icons = {
  Overview:   () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h7V2H2v9zm0 7h7v-5H2v5zm9 0h7v-9h-7v9zm0-16v5h7V2h-7z"/></svg>,
  Users:      () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H2zm11-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 8a5 5 0 0 0-5-5 5 5 0 0 1 9 0h-4z"/></svg>,
  Appearance: () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm.5 4.5h-1v5l4.3 2.5.5-.9-3.8-2.2V6.5z" opacity="0"/><circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2m-3.2-6.8-1.4 1.4M6.6 13.4l-1.4 1.4m0-10 1.4 1.4m6.8 6.8 1.4 1.4"/></svg>,
  Brand:      () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 1 0-2 0v1H7a1 1 0 0 0 0 2h1v1.1A6 6 0 0 0 10 18a6 6 0 0 0 2-11.9V6h1a1 1 0 1 0 0-2h-2V3z"/></svg>,
};

const NAV_ITEMS = [
  { key: 'overview',   label: 'Overview',   Icon: Icons.Overview },
  { key: 'users',      label: 'Users',      Icon: Icons.Users },
  { key: 'appearance', label: 'Appearance', Icon: Icons.Appearance },
  { key: 'brand',      label: 'Brand Info', Icon: Icons.Brand },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ nav, onNav, username, onLogout, open, onClose }) {
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
        {NAV_ITEMS.map(({ key, label, Icon }) => (
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div className={s.toast}>{msg}</div>;
}

// ── Overview panel ────────────────────────────────────────────────────────────
function OverviewPanel({ token, onNav, onLogout }) {
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

// ── Users panel ───────────────────────────────────────────────────────────────
function UsersPanel({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = await apiUsers(token, { page, search });
      setUsers(u.users); setTotal(u.total); setPages(u.pages);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
    } finally { setLoading(false); }
  }, [token, page, search, onLogout]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Users <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>All registered accounts in your CryptoCard app</p>
      </div>

      <form className={s.searchRow} onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
        <input className={s.searchInput} placeholder="Search by name, email or phone…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <button className={s.searchBtn} type="submit">Search</button>
        {search && <button className={s.clearBtn} type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>Clear</button>}
      </form>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>#</th><th>User</th><th>Contact</th><th>Wallet</th><th>Verified</th><th>Joined</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.tdCenter}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className={s.tdCenter}>No users found</td></tr>
            ) : users.map((u, i) => (
              <tr key={u._id}>
                <td className={s.numCell}>{(page - 1) * 20 + i + 1}</td>
                <td><div className={s.userCell}><Avatar name={u.name} email={u.email} phone={u.phone} />
                  <span className={s.userName}>{u.name || <em className={s.dim}>—</em>}</span></div></td>
                <td className={s.contactCell}>
                  {u.email && <div>{u.email}</div>}
                  {u.phone && <div className={s.dim}>{u.countryCode} {u.phone}</div>}
                  {!u.email && !u.phone && <span className={s.dim}>—</span>}
                </td>
                <td>{u.walletAddress ? <span className={s.badge + ' ' + s.bGreen}>{u.walletName || 'Connected'}</span> : <span className={s.badge + ' ' + s.bGrey}>None</span>}</td>
                <td>{u.isVerified ? <span className={s.badge + ' ' + s.bGreen}>Verified</span> : <span className={s.badge + ' ' + s.bGrey}>Pending</span>}</td>
                <td className={s.dim}>{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className={s.pagination}>
          <button className={s.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className={s.pageInfo}>Page {page} of {pages}</span>
          <button className={s.pageBtn} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ── Appearance panel ──────────────────────────────────────────────────────────
function AppearancePanel({ token }) {
  const [cfg, setCfg] = useState({});
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(null);
  const [toastMsg, showToast] = useToast();
  const fileRef = useRef(null);

  useEffect(() => { apiGetConfig().then(c => { setCfg(c); setPreview(c?.logoUrl || null); }).catch(() => {}); }, []);

  async function handleThemeSelect(key) {
    if (key === cfg.activeTheme || themeLoading) return;
    setThemeLoading(key);
    try {
      const updated = await apiSaveConfig(token, { activeTheme: key });
      setCfg(updated); showToast(`Theme set to "${key}" — frontend will update on next load`);
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setThemeLoading(null); }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { config } = await apiUploadLogo(token, file);
      setCfg(config); setPreview(config.logoUrl);
      showToast('Logo uploaded — frontend will use it on next load');
    } catch (e) { showToast('Upload error: ' + e.message); setPreview(cfg.logoUrl || null); }
    finally { setUploading(false); }
  }

  async function handleRemoveLogo() {
    try {
      const updated = await apiSaveConfig(token, { logoUrl: '' });
      setCfg(updated); setPreview(null);
      showToast('Logo removed — frontend will revert to default');
    } catch (e) { showToast('Error: ' + e.message); }
  }

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Appearance</h2>
        <p className={s.panelSub}>Controls theme and logo across the entire frontend app</p>
      </div>

      {/* Logo */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>Brand Logo</div>
            <div className={s.cardSub}>PNG / JPG / SVG · max 5 MB · shown in app header and login screen</div>
          </div>
        </div>
        <div className={s.logoRow}>
          <div className={s.logoBox}>
            {preview ? <img src={preview} alt="logo" className={s.logoImg} /> : (
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" opacity=".3">
                <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
                <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="#000" />
              </svg>
            )}
            {uploading && <div className={s.logoOverlay}>Uploading…</div>}
          </div>
          <div className={s.logoActions}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            <button className={s.btnPrimary} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload logo'}
            </button>
            {cfg.logoUrl && <button className={s.btnDanger} onClick={handleRemoveLogo}>Remove</button>}
            {cfg.logoUrl && <a href={cfg.logoUrl} target="_blank" rel="noreferrer" className={s.linkSmall}>View current ↗</a>}
          </div>
        </div>
      </div>

      {/* Theme picker */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>App Theme</div>
            <div className={s.cardSub}>Active: <strong>{cfg.activeTheme || 'light'}</strong> · Changes apply on frontend next page load</div>
          </div>
        </div>
        <div className={s.themeGrid}>
          {THEME_REGISTRY.map(t => {
            const isActive  = (cfg.activeTheme || 'light') === t.key;
            const isLoading = themeLoading === t.key;
            return (
              <button key={t.key}
                className={s.themeCard + (isActive ? ' ' + s.themeCardActive : '')}
                onClick={() => handleThemeSelect(t.key)}
                disabled={!!themeLoading}
              >
                <div className={s.themePreview} style={{ background: t.bg }}>
                  <div className={s.tpSurface} style={{ background: t.surface }}>
                    <div className={s.tpDot} style={{ background: t.accent }} />
                    <div className={s.tpBar}  style={{ background: t.text, opacity: .35 }} />
                    <div className={s.tpBar2} style={{ background: t.text, opacity: .2 }} />
                  </div>
                </div>
                <div className={s.themeInfo}>
                  <span className={s.themeName} style={{ color: isActive ? '#6366f1' : undefined }}>{t.label}</span>
                  <span className={s.themeDesc}>{t.desc}</span>
                </div>
                {isActive && !isLoading && <span className={s.themeCheck}>✓</span>}
                {isLoading && <span className={s.themeSpinner} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Brand panel ───────────────────────────────────────────────────────────────
function BrandPanel({ token }) {
  const [cfg, setCfg] = useState({ brandName: '', tagline: '', supportEmail: '', supportPhone: '', websiteUrl: '' });
  const [saving, setSaving] = useState(false);
  const [toastMsg, showToast] = useToast();

  useEffect(() => { apiGetConfig().then(c => { if (c) setCfg(prev => ({ ...prev, ...c })); }).catch(() => {}); }, []);

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await apiSaveConfig(token, {
        brandName: cfg.brandName, tagline: cfg.tagline,
        supportEmail: cfg.supportEmail, supportPhone: cfg.supportPhone,
        websiteUrl: cfg.websiteUrl,
      });
      setCfg(prev => ({ ...prev, ...updated }));
      showToast('Brand info saved — frontend will reflect changes on next load');
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className={s.fieldGroup}>
      <label className={s.label}>{label}</label>
      <input className={s.input} type={type} placeholder={placeholder}
        value={cfg[key] || ''} onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Brand Info</h2>
        <p className={s.panelSub}>These values are consumed across the frontend app — header, auth sheet, hero section, support sheet</p>
      </div>

      <form className={s.card} onSubmit={handleSave}>
        <div className={s.cardHead}>
          <div className={s.cardTitle}>Identity</div>
          <div className={s.cardSub}>Displayed in app header, login screen and web nav</div>
        </div>
        <div className={s.formGrid}>
          {field('brandName',   'Brand Name',  'text',  'CryptoCard Pro')}
          {field('tagline',     'Tagline',     'text',  'Pay with Crypto, Anywhere in the World')}
          {field('websiteUrl',  'Website URL', 'url',   'https://cryptocard.com')}
        </div>

        <div className={s.cardTitle} style={{ marginTop: 24, marginBottom: 4 }}>Support Contact</div>
        <div className={s.cardSub} style={{ marginBottom: 16 }}>Shown in the in-app support sheet</div>
        <div className={s.formGrid}>
          {field('supportEmail', 'Support Email', 'email', 'support@cryptocard.com')}
          {field('supportPhone', 'Support Phone', 'text',  '+1 234 567 8900')}
        </div>

        <div className={s.cardFooter}>
          <div className={s.previewNote}>
            <strong>Frontend usage:</strong> brand name → header & auth login · tagline → hero section · support email/phone → support sheet
          </div>
          <button className={s.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try { const { token, username: u } = await apiLogin(username, password); onLogin(token, u); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className={s.loginWrap}>
      <form className={s.loginCard} onSubmit={submit}>
        <div className={s.loginLogo}>
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
            <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="rgba(0,0,0,.4)" />
          </svg>
          <div>
            <div className={s.loginBrand}>CryptoCard</div>
            <div className={s.loginSubtitle}>Admin Panel</div>
          </div>
        </div>
        <div className={s.fieldGroup}>
          <label className={s.label}>Username</label>
          <input className={s.input} type="text" autoComplete="username" placeholder="admin"
            value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={s.fieldGroup}>
          <label className={s.label}>Password</label>
          <div className={s.inputWrap}>
            <input className={s.input} type={showPw ? 'text' : 'password'} autoComplete="current-password"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {err && <div className={s.loginErr}>{err}</div>}
        <button className={s.btnPrimary} style={{ width: '100%', padding: '12px' }} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ── Mobile header ─────────────────────────────────────────────────────────────
function MobileHeader({ username, onMenuOpen, onLogout }) {
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

// ── Root ──────────────────────────────────────────────────────────────────────
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

  return (
    <div className={s.shell}>
      {/* Mobile header — hidden on desktop via CSS */}
      <MobileHeader username={username} onMenuOpen={() => setSidebar(true)} onLogout={handleLogout} />

      {/* Overlay — mobile only */}
      {sidebarOpen && (
        <div className={s.sidebarOverlay} onClick={() => setSidebar(false)} />
      )}

      <Sidebar
        nav={nav}
        onNav={setNav}
        username={username}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebar(false)}
      />

      <div className={s.content}>
        {nav === 'overview'   && <OverviewPanel   token={token} onNav={setNav} onLogout={handleLogout} />}
        {nav === 'users'      && <UsersPanel      token={token} onLogout={handleLogout} />}
        {nav === 'appearance' && <AppearancePanel token={token} />}
        {nav === 'brand'      && <BrandPanel      token={token} />}
      </div>
    </div>
  );
}
