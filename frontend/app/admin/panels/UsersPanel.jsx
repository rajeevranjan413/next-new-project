'use client';

import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';
import { apiUsers } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';
import { Avatar } from '../components/Avatar.jsx';
import { Pagination } from '../components/Pagination.jsx';

export function UsersPanel({ token, onLogout }) {
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

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
