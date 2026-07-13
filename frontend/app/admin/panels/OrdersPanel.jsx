'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import s from '../admin.module.css';
import { apiOrders, apiUpdateOrder } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';
import { ORDER_STAGE_META, ORDER_FILTERS, PAY_LABEL } from '../lib/constants.js';
import { Avatar } from '../components/Avatar.jsx';
import { Toast } from '../components/Toast.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

export function OrdersPanel({ token, onLogout }) {
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

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
