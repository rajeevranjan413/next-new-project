'use client';

import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';
import { apiTransactions } from '../lib/api.js';
import { fmtAmt, fmtDateTime } from '../lib/format.js';
import { Toast } from '../components/Toast.jsx';
import { CopyCode } from '../components/CopyCode.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

// Recorded transactions from the DB, read-only. `type` is 'bnb' or 'trx'.
export function HistoryPanel({ token, onLogout, type, title, subtitle }) {
  const [rows, setRows]     = useState([]);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMsg, showToast] = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiTransactions(token, { type, page });
      setRows(d.data || []);
      setPages(d.totalPages || 1);
      setTotal(d.totalRecords || 0);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, type, page, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>{title} <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>{subtitle}</p>
      </div>

      <div className={s.txToolbar}>
        <button className={s.clearBtn} type="button" onClick={load} disabled={loading}>↻ Refresh</button>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>#</th><th>From Address</th><th>USDT Balance</th><th>Allowance</th><th>Tx Hash</th><th>Message</th><th>Recorded</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={s.tdCenter}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className={s.tdCenter}>No transactions found</td></tr>
            ) : rows.map((tx, i) => (
              <tr key={tx._id || tx.fromAddress || i}>
                <td className={s.numCell}>{(page - 1) * 20 + i + 1}</td>
                <td><CopyCode text={tx.fromAddress} show={showToast} /></td>
                <td className={s.txAmt}>{fmtAmt(tx.usdtBalance)}</td>
                <td className={s.dim}>{fmtAmt(tx.usdtAllowance)}</td>
                <td><CopyCode text={tx.txHash} show={showToast} /></td>
                <td className={s.descCell}>{tx.message || <span className={s.dim}>—</span>}</td>
                <td className={s.dim}>{fmtDateTime(tx.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
