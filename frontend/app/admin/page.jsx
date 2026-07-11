'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
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
async function apiTickets(token, { page = 1, status = '', search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (status) p.set('status', status);
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/tickets?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
async function apiUpdateTicket(token, id, fields) {
  const r = await fetch(`${API}/api/tickets/${id}`, { method: 'PATCH', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.ticket;
}
async function apiOrders(token, { page = 1, status = '', search = '' } = {}) {
  const p = new URLSearchParams({ page, limit: 20 });
  if (status) p.set('status', status);
  if (search) p.set('search', search);
  const r = await fetch(`${API}/api/cryptocard/orders?${p}`, { headers: auth(token) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d;
}
async function apiUpdateOrder(token, id, fields) {
  const r = await fetch(`${API}/api/cryptocard/orders/${id}`, { method: 'PATCH', headers: { ...json, ...auth(token) }, body: JSON.stringify(fields) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.order;
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
  // Memoized so its identity is stable — otherwise any effect/useCallback that
  // depends on `show` (e.g. TicketsPanel's data loader) would re-run every
  // render and spin into an infinite fetch loop.
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(''), 3200); }, []);
  return [msg, show];
}

// ── Sidebar icons ─────────────────────────────────────────────────────────────
const Icons = {
  Overview:   () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h7V2H2v9zm0 7h7v-5H2v5zm9 0h7v-9h-7v9zm0-16v5h7V2h-7z"/></svg>,
  Users:      () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H2zm11-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 8a5 5 0 0 0-5-5 5 5 0 0 1 9 0h-4z"/></svg>,
  Appearance: () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm.5 4.5h-1v5l4.3 2.5.5-.9-3.8-2.2V6.5z" opacity="0"/><circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2m-3.2-6.8-1.4 1.4M6.6 13.4l-1.4 1.4m0-10 1.4 1.4m6.8 6.8 1.4 1.4"/></svg>,
  Brand:      () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 1 0-2 0v1H7a1 1 0 0 0 0 2h1v1.1A6 6 0 0 0 10 18a6 6 0 0 0 2-11.9V6h1a1 1 0 1 0 0-2h-2V3z"/></svg>,
  Tickets:    () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 5a2 2 0 0 0-2 2v1.5a1.5 1.5 0 0 1 0 3V13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.5a1.5 1.5 0 0 1 0-3V7a2 2 0 0 0-2-2H3zm10 1h1v1h-1V6zm0 3h1v1h-1V9zm0 3h1v1h-1v-1z"/></svg>,
  Voucher:    () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.6l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L10 18.4l-2.2-1.6-2.7.2-.9-2.6L2 12.8l.9-2.6L2 7.6l2.2-1.6.9-2.6 2.7.2L10 1.6zm-1 9.9l4-4-1-1-3 3-1.5-1.5-1 1L9 11.5z"/></svg>,
  Orders:     () => <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h11l1 3h2a1 1 0 0 1 1 1v6h-2.05a2.5 2.5 0 0 1-4.9 0H8.95a2.5 2.5 0 0 1-4.9 0H3V3zm11 4V5H5v8h.05a2.5 2.5 0 0 1 4.9 0h3.1c.16-.6.5-1.1.95-1.45V7h-3zm1 6.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm-8 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/></svg>,
};

const NAV_ITEMS = [
  { key: 'overview',   label: 'Overview',   Icon: Icons.Overview },
  { key: 'users',      label: 'Users',      Icon: Icons.Users },
  { key: 'orders',     label: 'Orders',     Icon: Icons.Orders },
  { key: 'tickets',    label: 'Tickets',    Icon: Icons.Tickets },
  { key: 'appearance', label: 'Appearance', Icon: Icons.Appearance },
  { key: 'brand',      label: 'Brand Info', Icon: Icons.Brand },
  { key: 'voucher',    label: 'Voucher Popup', Icon: Icons.Voucher },
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

// ── Tickets panel ─────────────────────────────────────────────────────────────
const TICKET_CHANNELS = {
  tg:    { label: 'Telegram', color: '#229ED9' },
  wa:    { label: 'WhatsApp', color: '#25D366' },
  email: { label: 'Email',    color: '#EA4335' },
};
const STATUS_META = {
  open:        { label: 'Open',        badge: 'bBlue'  },
  in_progress: { label: 'In Progress', badge: 'bAmber' },
  resolved:    { label: 'Resolved',    badge: 'bGreen' },
};
const STATUS_FILTERS = [
  { key: '',            label: 'All' },
  { key: 'open',        label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved' },
];

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function TicketsPanel({ token, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts]   = useState({ open: 0, in_progress: 0, resolved: 0 });
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState('');
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, showToast] = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiTickets(token, { page, status, search });
      setTickets(d.tickets); setTotal(d.total); setPages(d.pages);
      if (d.counts) setCounts(d.counts);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, page, status, search, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(ticket, next) {
    if (next === ticket.status) return;
    setUpdatingId(ticket._id);
    try {
      const updated = await apiUpdateTicket(token, ticket._id, { status: next });
      setTickets(list => list.map(t => (t._id === ticket._id ? updated : t)));
      // Keep the header counts in sync without a full refetch.
      setCounts(c => ({ ...c, [ticket.status]: Math.max(0, c[ticket.status] - 1), [next]: c[next] + 1 }));
      showToast(`Ticket ${updated.ref} → ${STATUS_META[next].label}`);
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally { setUpdatingId(null); }
  }

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Support Tickets <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>Tickets submitted from the in-app Support Center — from both registered users and guests</p>
      </div>

      {/* Status filter chips */}
      <div className={s.filterRow}>
        {STATUS_FILTERS.map(f => {
          const active = status === f.key;
          const count = f.key ? counts[f.key] : (counts.open + counts.in_progress + counts.resolved);
          return (
            <button key={f.key || 'all'}
              className={s.filterChip + (active ? ' ' + s.filterChipActive : '')}
              onClick={() => { setStatus(f.key); setPage(1); }}>
              {f.label}<span className={s.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form className={s.searchRow} onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
        <input className={s.searchInput} placeholder="Search by ref, contact, name or message…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <button className={s.searchBtn} type="submit">Search</button>
        {search && <button className={s.clearBtn} type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>Clear</button>}
      </form>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Ref</th><th>From</th><th>Channel</th><th>Message</th><th>Received</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.tdCenter}>Loading…</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} className={s.tdCenter}>No tickets found</td></tr>
            ) : tickets.map(tk => {
              const ch = TICKET_CHANNELS[tk.channel] || { label: tk.channelLabel || tk.channel, color: '#9ca3af' };
              const who = tk.userSnapshot?.name || tk.userSnapshot?.email
                || tk.userSnapshot?.phone || tk.contact;
              return (
                <tr key={tk._id}>
                  <td className={s.refCell}>{tk.ref}</td>
                  <td>
                    <div className={s.userCell}>
                      <Avatar name={tk.userSnapshot?.name} email={tk.userSnapshot?.email} phone={tk.contact} />
                      <div>
                        <div className={s.userName}>{who}</div>
                        <div className={s.dim}>
                          {tk.isGuest
                            ? <span className={s.badge + ' ' + s.bGrey}>Guest</span>
                            : <span className={s.badge + ' ' + s.bGreen}>Registered</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={s.chChip}>
                      <span className={s.chDot} style={{ background: ch.color }} />
                      {ch.label}
                    </span>
                    <div className={s.dim}>{tk.contact}</div>
                  </td>
                  <td className={s.descCell}>{tk.description}</td>
                  <td className={s.dim}>{fmtDateTime(tk.createdAt)}</td>
                  <td>
                    <select
                      className={s.statusSelect}
                      value={tk.status}
                      disabled={updatingId === tk._id}
                      onChange={e => changeStatus(tk, e.target.value)}
                    >
                      {Object.entries(STATUS_META).map(([key, m]) => (
                        <option key={key} value={key}>{m.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
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

// ── Orders panel ──────────────────────────────────────────────────────────────
const ORDER_STAGE_META = {
  order_placed:     { label: 'Order Placed',     badge: 'bBlue'  },
  payment_verified: { label: 'Payment Verified', badge: 'bAmber' },
  card_production:  { label: 'Card Production',   badge: 'bAmber' },
  shipped:          { label: 'Shipped',          badge: 'bBlue'  },
  out_for_delivery: { label: 'Out for Delivery', badge: 'bAmber' },
  delivered:        { label: 'Delivered',        badge: 'bGreen' },
  cancelled:        { label: 'Cancelled',        badge: 'bGrey'  },
};
const ORDER_FILTERS = [
  { key: '',                 label: 'All' },
  { key: 'order_placed',     label: 'Placed' },
  { key: 'payment_verified', label: 'Verified' },
  { key: 'card_production',  label: 'Production' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
  { key: 'cancelled',        label: 'Cancelled' },
];
const PAY_LABEL = { crypto: 'Crypto (USDT)', cod: 'Cash on Delivery' };

function OrdersPanel({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [toastMsg, showToast] = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiOrders(token, { page, status, search });
      setOrders(d.orders); setTotal(d.total); setPages(d.pages);
      if (d.counts) setCounts(d.counts);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, page, status, search, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(order, next) {
    if (next === order.status) return;
    setUpdatingId(order._id);
    try {
      const updated = await apiUpdateOrder(token, order._id, { status: next });
      setOrders(list => list.map(o => (o._id === order._id ? updated : o)));
      setCounts(c => ({ ...c, [order.status]: Math.max(0, (c[order.status] || 0) - 1), [next]: (c[next] || 0) + 1 }));
      showToast(`${updated.ref} → ${ORDER_STAGE_META[next].label}`);
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally { setUpdatingId(null); }
  }

  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Physical Card Orders <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>Advance each order through fulfilment — customers see the timeline update live in-app</p>
      </div>

      <div className={s.filterRow}>
        {ORDER_FILTERS.map(f => {
          const active = status === f.key;
          const count = f.key ? (counts[f.key] || 0) : allCount;
          return (
            <button key={f.key || 'all'}
              className={s.filterChip + (active ? ' ' + s.filterChipActive : '')}
              onClick={() => { setStatus(f.key); setPage(1); }}>
              {f.label}<span className={s.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <form className={s.searchRow} onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
        <input className={s.searchInput} placeholder="Search by ref, name, city or email…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <button className={s.searchBtn} type="submit">Search</button>
        {search && <button className={s.clearBtn} type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>Clear</button>}
      </form>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Ref</th><th>Customer</th><th>Design</th><th>Payment</th><th>Placed</th><th>Stage</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.tdCenter}>Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className={s.tdCenter}>No orders found</td></tr>
            ) : orders.map(o => {
              const isOpen = expanded === o._id;
              return (
                <Fragment key={o._id}>
                  <tr>
                    <td className={s.refCell}>
                      <button className={s.orderRefBtn} onClick={() => setExpanded(isOpen ? null : o._id)}>
                        {isOpen ? '▾' : '▸'} {o.ref}
                      </button>
                    </td>
                    <td>
                      <div className={s.userCell}>
                        <Avatar name={o.shipping?.fullName} email={o.userSnapshot?.email} phone={o.shipping?.phone} />
                        <div>
                          <div className={s.userName}>{o.shipping?.fullName || '—'}</div>
                          <div className={s.dim}>{[o.shipping?.city, o.shipping?.country].filter(Boolean).join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className={s.dim} style={{ textTransform: 'capitalize' }}>{o.design}</td>
                    <td>
                      <div>{PAY_LABEL[o.payMethod] || o.payMethod}</div>
                      {o.payNetwork && <div className={s.dim} style={{ textTransform: 'uppercase' }}>{o.payNetwork}</div>}
                    </td>
                    <td className={s.dim}>{fmtDateTime(o.createdAt)}</td>
                    <td>
                      <select
                        className={s.statusSelect}
                        value={o.status}
                        disabled={updatingId === o._id}
                        onChange={e => changeStatus(o, e.target.value)}
                      >
                        {Object.entries(ORDER_STAGE_META).map(([key, m]) => (
                          <option key={key} value={key}>{m.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={o._id + '-d'} className={s.orderDetailRow}>
                      <td colSpan={6}>
                        <div className={s.orderDetail}>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Shipping address</div>
                            <div className={s.orderAddr}>
                              <div>{o.shipping?.fullName}</div>
                              <div>{o.shipping?.line1}{o.shipping?.line2 ? `, ${o.shipping.line2}` : ''}</div>
                              <div>{[o.shipping?.city, o.shipping?.state, o.shipping?.zip].filter(Boolean).join(', ')}</div>
                              <div>{o.shipping?.country}</div>
                              <div className={s.dim}>{o.shipping?.countryCode} {o.shipping?.phone}</div>
                            </div>
                          </div>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Timeline</div>
                            <div className={s.orderTimeline}>
                              {(o.timeline || []).map((t, i) => (
                                <div key={i} className={s.orderTlRow}>
                                  <span className={s.orderTlDot} />
                                  <span className={s.orderTlStage}>{ORDER_STAGE_META[t.stage]?.label || t.stage}</span>
                                  <span className={s.dim}>{fmtDateTime(t.at)}</span>
                                </div>
                              ))}
                            </div>
                            {o.payAddress && (
                              <div className={s.orderPayAddr}>
                                <span className={s.orderDetailHead}>Pay address</span>
                                <code>{o.payAddress}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
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

// ── Voucher popup panel ─────────────────────────────────────────────────────────
// Placeholders double as the built-in fallback copy so the admin sees what a
// blank field will render as on the live app.
const VOUCHER_PLACEHOLDERS = {
  limitedText: 'LIMITED — Today Only',
  title:       'Apply Today & Get',
  highlight:   '100 USDT FREE',
  subtitle:    'Welcome bonus for new applicants — today only!',
  amount:      '100 USDT',
  bonusNote:   'Min. 100 USDT transaction → auto-claimed to wallet',
  ctaText:     'Apply Now — Claim 100 USDT',
  skipText:    "No thanks, I'll miss this",
};

function VoucherPanel({ token }) {
  const [v, setV] = useState({
    enabled: true, limitedText: '', title: '', highlight: '', subtitle: '',
    amount: '', bonusNote: '', offerMinutes: 15, ctaText: '', slots: 47, skipText: '',
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, showToast] = useToast();

  useEffect(() => {
    apiGetConfig().then(c => { if (c?.voucher) setV(prev => ({ ...prev, ...c.voucher })); }).catch(() => {});
  }, []);

  const set = (key, val) => setV(x => ({ ...x, [key]: val }));

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await apiSaveConfig(token, {
        voucher: {
          ...v,
          offerMinutes: Number(v.offerMinutes) || 15,
          slots: Number(v.slots) || 0,
        },
      });
      if (updated?.voucher) setV(prev => ({ ...prev, ...updated.voucher }));
      showToast('Voucher popup saved — frontend updates on next load');
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  const txt = (key, label, full = false) => (
    <div className={s.fieldGroup} style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label className={s.label}>{label}</label>
      <input className={s.input} type="text" placeholder={VOUCHER_PLACEHOLDERS[key] || ''}
        value={v[key] ?? ''} onChange={e => set(key, e.target.value)} />
    </div>
  );

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Voucher Popup</h2>
        <p className={s.panelSub}>The welcome-bonus popup that greets visitors. Leave a text field blank to use the app’s built-in translated copy.</p>
      </div>

      <form className={s.card} onSubmit={handleSave}>
        {/* Enable toggle */}
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>Show popup</div>
            <div className={s.cardSub}>Turn the welcome-bonus popup on or off for all visitors</div>
          </div>
          <button type="button" role="switch" aria-checked={v.enabled}
            onClick={() => set('enabled', !v.enabled)}
            style={{
              width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
              position: 'relative', flexShrink: 0,
              background: v.enabled ? '#6366f1' : '#d1d5db', transition: 'background .2s',
            }}>
            <span style={{
              position: 'absolute', top: 3, left: v.enabled ? 23 : 3, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }} />
          </button>
        </div>

        <div className={s.cardTitle} style={{ marginTop: 20, marginBottom: 4 }}>Content</div>
        <div className={s.cardSub} style={{ marginBottom: 16 }}>Marketing copy shown inside the popup</div>
        <div className={s.formGrid}>
          {txt('limitedText', 'Urgency ribbon')}
          {txt('amount', 'Bonus amount (big number)')}
          {txt('title', 'Headline')}
          {txt('highlight', 'Highlighted line')}
          {txt('subtitle', 'Subtitle', true)}
          {txt('bonusNote', 'Bonus note', true)}
          {txt('ctaText', 'Button text')}
          {txt('skipText', 'Dismiss link text')}
        </div>

        <div className={s.cardTitle} style={{ marginTop: 20, marginBottom: 4 }}>Behaviour</div>
        <div className={s.cardSub} style={{ marginBottom: 16 }}>Countdown length and the starting scarcity number</div>
        <div className={s.formGrid}>
          <div className={s.fieldGroup}>
            <label className={s.label}>Countdown (minutes)</label>
            <input className={s.input} type="number" min={1} max={240}
              value={v.offerMinutes} onChange={e => set('offerMinutes', e.target.value)} />
          </div>
          <div className={s.fieldGroup}>
            <label className={s.label}>Starting “slots left”</label>
            <input className={s.input} type="number" min={0} max={100000}
              value={v.slots} onChange={e => set('slots', e.target.value)} />
          </div>
        </div>

        <div className={s.cardFooter}>
          <div className={s.previewNote}>
            <strong>Note:</strong> blank text fields fall back to the app’s localized copy; numbers and the on/off toggle always apply. Changes appear on the visitor’s next page load.
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
        {nav === 'orders'     && <OrdersPanel     token={token} onLogout={handleLogout} />}
        {nav === 'tickets'    && <TicketsPanel    token={token} onLogout={handleLogout} />}
        {nav === 'appearance' && <AppearancePanel token={token} />}
        {nav === 'brand'      && <BrandPanel      token={token} />}
        {nav === 'voucher'    && <VoucherPanel    token={token} />}
      </div>
    </div>
  );
}
