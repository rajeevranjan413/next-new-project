'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import s from '../admin.module.css';
import { apiFundRequests, apiUpdateFundRequest } from '../lib/api.js';
import { fmtDateTime, fmtAmt, shortMid } from '../lib/format.js';
import { FUND_STATUS_META, FUND_FILTERS, FUND_NETWORK_LABEL } from '../lib/constants.js';
import { Avatar } from '../components/Avatar.jsx';
import { Toast } from '../components/Toast.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

export function FundRequestsPanel({ token, onLogout }) {
  const [requests, setRequests] = useState([]);
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
      const d = await apiFundRequests(token, { page, status, search });
      setRequests(d.requests); setTotal(d.total); setPages(d.pages);
      if (d.counts) setCounts(d.counts);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, page, status, search, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  async function decide(req, next) {
    if (next === req.status) return;
    setUpdatingId(req._id);
    try {
      const updated = await apiUpdateFundRequest(token, req._id, { status: next });
      setRequests(list => list.map(r => (r._id === req._id ? updated : r)));
      setCounts(c => ({ ...c, [req.status]: Math.max(0, (c[req.status] || 0) - 1), [next]: (c[next] || 0) + 1 }));
      const verb = next === 'approved' ? 'approved — wallet credited' : next === 'rejected' ? 'rejected' : FUND_STATUS_META[next].label;
      showToast(`${updated.ref} ${verb}`);
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally { setUpdatingId(null); }
  }

  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Add-Funds Requests <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>Review each top-up request and approve it to credit the user’s wallet balance. Nothing is credited until you approve.</p>
      </div>

      <div className={s.filterRow}>
        {FUND_FILTERS.map(f => {
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
        <input className={s.searchInput} placeholder="Search by ref, name, email or tx hash…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <button className={s.searchBtn} type="submit">Search</button>
        {search && <button className={s.clearBtn} type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>Clear</button>}
      </form>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Ref</th><th>Customer</th><th>Amount</th><th>Network</th><th>Requested</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.tdCenter}>Loading…</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className={s.tdCenter}>No requests found</td></tr>
            ) : requests.map(r => {
              const isOpen = expanded === r._id;
              const meta = FUND_STATUS_META[r.status] || { label: r.status, badge: 'bGrey' };
              return (
                <Fragment key={r._id}>
                  <tr>
                    <td className={s.refCell}>
                      <button className={s.orderRefBtn} onClick={() => setExpanded(isOpen ? null : r._id)}>
                        {isOpen ? '▾' : '▸'} {r.ref}
                      </button>
                    </td>
                    <td>
                      <div className={s.userCell}>
                        <Avatar name={r.userSnapshot?.name} email={r.userSnapshot?.email} phone={r.userSnapshot?.phone} />
                        <div>
                          <div className={s.userName}>{r.userSnapshot?.name || '—'}</div>
                          <div className={s.dim}>{r.userSnapshot?.email || (r.userSnapshot?.phone ? `${r.userSnapshot?.countryCode || ''} ${r.userSnapshot.phone}` : '')}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{fmtAmt(r.amount)} USDT</strong></td>
                    <td className={s.dim}>{FUND_NETWORK_LABEL[r.network] || r.network || '—'}</td>
                    <td className={s.dim}>{fmtDateTime(r.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`${s.badge} ${s[meta.badge]}`}>{meta.label}</span>
                        <select
                          className={s.statusSelect}
                          value={r.status}
                          disabled={updatingId === r._id}
                          onChange={e => decide(r, e.target.value)}
                        >
                          {Object.entries(FUND_STATUS_META).map(([key, m]) => (
                            <option key={key} value={key}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={r._id + '-d'} className={s.orderDetailRow}>
                      <td colSpan={6}>
                        <div className={s.orderDetail}>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Requester</div>
                            <div className={s.orderAddr}>
                              <div>{r.userSnapshot?.name || '—'}</div>
                              {r.userSnapshot?.email && <div>{r.userSnapshot.email}</div>}
                              {r.userSnapshot?.phone && <div className={s.dim}>{r.userSnapshot?.countryCode} {r.userSnapshot.phone}</div>}
                            </div>
                          </div>
                          <div className={s.orderDetailCol}>
                            <div className={s.orderDetailHead}>Payment</div>
                            <div className={s.orderAddr}>
                              <div><strong>{fmtAmt(r.amount)} USDT</strong> · {FUND_NETWORK_LABEL[r.network] || r.network || '—'}</div>
                              <div className={s.dim}>Requested {fmtDateTime(r.createdAt)}</div>
                              {r.decidedAt && <div className={s.dim}>Decided {fmtDateTime(r.decidedAt)}</div>}
                              {r.credited && <div className={s.dim}>Wallet credited ✓</div>}
                            </div>
                            {r.payAddress && (
                              <div className={s.orderPayAddr}>
                                <span className={s.orderDetailHead}>Paid to</span>
                                <code>{r.payAddress}</code>
                              </div>
                            )}
                            {r.txHash && (
                              <div className={s.orderPayAddr}>
                                <span className={s.orderDetailHead}>Tx hash</span>
                                <code>{shortMid(r.txHash, 12, 10)}</code>
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

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
