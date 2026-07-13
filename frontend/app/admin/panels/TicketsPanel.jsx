'use client';

import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';
import { apiTickets, apiUpdateTicket } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';
import { TICKET_CHANNELS, TICKET_STATUS_META, TICKET_STATUS_FILTERS } from '../lib/constants.js';
import { Avatar } from '../components/Avatar.jsx';
import { Toast } from '../components/Toast.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

export function TicketsPanel({ token, onLogout }) {
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
      showToast(`Ticket ${updated.ref} → ${TICKET_STATUS_META[next].label}`);
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
        {TICKET_STATUS_FILTERS.map(f => {
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
                      {Object.entries(TICKET_STATUS_META).map(([key, m]) => (
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

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
