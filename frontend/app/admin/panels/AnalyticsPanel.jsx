'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import s from '../admin.module.css';
import { apiPreLoginSessions } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';
import { Avatar } from '../components/Avatar.jsx';
import { Toast } from '../components/Toast.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

// Read-only view of pre-login / pre-signup lead sessions captured from the login &
// signup forms (see backend routes/analytics.js). One row per browser session.
export function AnalyticsPanel({ token, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [toastMsg, showToast] = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiPreLoginSessions(token, { page, search });
      setSessions(d.sessions); setTotal(d.total); setPages(d.pages);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, page, search, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  const fullName = (r) => [r.firstName, r.lastName].filter(Boolean).join(' ');
  const device   = (r) => [r.device?.browser, r.device?.os].filter(Boolean).join(' · ') || '—';
  const refHost  = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const source   = (r) => r.utm?.source || (r.referrerUrl ? refHost(r.referrerUrl) : '') || 'direct';
  const place    = (r) => [r.geo?.city, r.geo?.country].filter(Boolean).join(', ') || '—';

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Lead Analytics <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>Pre-login activity captured from the login &amp; signup forms — partial inputs, device, location &amp; attribution</p>
      </div>

      <form className={s.searchRow} onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
        <input className={s.searchInput} placeholder="Search by email, phone, IP or session id…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <button className={s.searchBtn} type="submit">Search</button>
        {search && <button className={s.clearBtn} type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>Clear</button>}
      </form>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Session</th><th>Lead</th><th>Location</th><th>Device</th><th>Source</th><th>First seen</th><th>Events</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={s.tdCenter}>Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={7} className={s.tdCenter}>No lead sessions yet</td></tr>
            ) : sessions.map(r => {
              const isOpen = expanded === r._id;
              return (
                <Fragment key={r._id}>
                  <tr>
                    <td className={s.refCell}>
                      <button className={s.orderRefBtn} onClick={() => setExpanded(isOpen ? null : r._id)}>
                        {isOpen ? '▾' : '▸'} {String(r.sessionId).slice(0, 8)}…
                      </button>
                    </td>
                    <td>
                      <div className={s.userCell}>
                        <Avatar name={fullName(r)} email={r.email} phone={r.phoneNumber} />
                        <div>
                          <div className={s.userName}>{fullName(r) || '—'}</div>
                          <div className={s.dim}>{r.email || (r.phoneNumber ? `${r.countryCode || ''} ${r.phoneNumber}` : '—')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{place(r)}</div>
                      <div className={s.dim}>{r.ipAddress || '—'}</div>
                    </td>
                    <td>
                      <div style={{ textTransform: 'capitalize' }}>{r.device?.type || '—'}</div>
                      <div className={s.dim}>{device(r)}</div>
                    </td>
                    <td className={s.dim}>{source(r)}</td>
                    <td className={s.dim}>{fmtDateTime(r.createdAt)}</td>
                    <td className={s.dim}>{r.eventCount}</td>
                  </tr>
                  {isOpen && (
                    <tr key={r._id + '-d'} className={s.orderDetailRow}>
                      <td colSpan={7}>
                        <div className={s.orderDetail}>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Captured inputs</div>
                            <div className={s.orderAddr}>
                              <div>Name: {fullName(r) || '—'}</div>
                              <div>Email: {r.email || '—'}</div>
                              <div>Phone: {r.phoneNumber ? `${r.countryCode || ''} ${r.phoneNumber}` : '—'}</div>
                            </div>
                            <div className={s.orderDetailHead} style={{ marginTop: 12 }}>Network &amp; location</div>
                            <div className={s.orderAddr}>
                              <div>IP: {r.ipAddress || '—'}</div>
                              <div>Country: {r.geo?.country || '—'}</div>
                              <div>Region: {r.geo?.region || '—'}</div>
                              <div>City: {r.geo?.city || '—'}</div>
                            </div>
                          </div>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Device</div>
                            <div className={s.orderAddr}>
                              <div style={{ textTransform: 'capitalize' }}>Type: {r.device?.type || '—'}</div>
                              <div>OS: {r.device?.os || '—'}</div>
                              <div>Browser: {[r.device?.browser, r.device?.browserVersion].filter(Boolean).join(' ') || '—'}</div>
                            </div>
                            <div className={s.orderDetailHead} style={{ marginTop: 12 }}>Attribution</div>
                            <div className={s.orderAddr}>
                              <div>utm_source: {r.utm?.source || '—'}</div>
                              <div>utm_medium: {r.utm?.medium || '—'}</div>
                              <div>utm_campaign: {r.utm?.campaign || '—'}</div>
                              <div>utm_content: {r.utm?.content || '—'}</div>
                              <div>utm_term: {r.utm?.term || '—'}</div>
                            </div>
                            {(r.referrerUrl || r.pageUrl) && (
                              <div className={s.orderPayAddr}>
                                {r.pageUrl && (<><span className={s.orderDetailHead}>Page</span><code>{r.pageUrl}</code></>)}
                                {r.referrerUrl && (<><span className={s.orderDetailHead}>Referrer</span><code>{r.referrerUrl}</code></>)}
                              </div>
                            )}
                            <div className={s.dim} style={{ marginTop: 10 }}>
                              First seen {fmtDateTime(r.createdAt)} · Last activity {fmtDateTime(r.updatedAt)} · {r.eventCount} events
                            </div>
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

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
