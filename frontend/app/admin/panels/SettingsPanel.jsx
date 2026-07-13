'use client';

import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';
import { apiGetSettings, apiUpdateSetting } from '../lib/api.js';
import { networkMeta } from '../lib/constants.js';
import { Toast } from '../components/Toast.jsx';
import { useToast } from '../lib/useToast.js';

// Per-network payment "amount" values (from the Setting collection). Each network
// is edited independently and saved via PUT /api/admin/settings { network, amount }.
export function SettingsPanel({ token, onLogout }) {
  const [settings, setSettings] = useState([]);
  const [drafts, setDrafts]     = useState({});   // network -> input string
  const [loading, setLoading]   = useState(true);
  const [savingNet, setSavingNet] = useState(null);
  const [toastMsg, showToast]   = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiGetSettings(token);
      setSettings(list);
      setDrafts(Object.fromEntries(list.map(x => [x.network, String(x.amount ?? '')])));
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setLoading(false); }
  }, [token, onLogout, showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(network) {
    const raw = drafts[network];
    const amount = Number(raw);
    if (raw === '' || Number.isNaN(amount)) { showToast('Enter a valid amount'); return; }
    setSavingNet(network);
    try {
      const updated = await apiUpdateSetting(token, network, amount);
      setSettings(list => list.map(x => (x.network === network ? { ...x, amount: updated.amount } : x)));
      setDrafts(d => ({ ...d, [network]: String(updated.amount ?? '') }));
      showToast(`${networkMeta(network).label} amount updated to ${updated.amount}`);
    } catch (e) {
      if (e.message?.includes('Unauthorized')) onLogout();
      else showToast('Error: ' + e.message);
    } finally { setSavingNet(null); }
  }

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Settings <span className={s.totalBadge}>{settings.length}</span></h2>
        <p className={s.panelSub}>Per-network payment amounts used across the app. Edit an amount and save each network individually.</p>
      </div>

      {loading ? (
        <div className={s.card}><div className={s.tdCenter} style={{ padding: 24 }}>Loading…</div></div>
      ) : settings.length === 0 ? (
        <div className={s.card}><div className={s.tdCenter} style={{ padding: 24 }}>No network settings found</div></div>
      ) : (
        <div className={s.formGrid}>
          {settings.map(x => {
            const m = networkMeta(x.network);
            const draft = drafts[x.network] ?? '';
            const dirty = draft !== String(x.amount ?? '');
            const saving = savingNet === x.network;
            return (
              <div className={s.card} key={x.network}>
                <div className={s.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={s.avatar} style={{ background: m.color }}>{(m.label || '?')[0].toUpperCase()}</span>
                    <div>
                      <div className={s.cardTitle}>{m.label}</div>
                      <div className={s.cardSub} style={{ textTransform: 'uppercase' }}>{x.network} · {m.sub}</div>
                    </div>
                  </div>
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Amount</label>
                  <input
                    className={s.input}
                    type="number"
                    step="any"
                    value={draft}
                    disabled={saving}
                    onChange={e => setDrafts(d => ({ ...d, [x.network]: e.target.value }))}
                  />
                </div>
                <div className={s.cardFooter}>
                  <div className={s.previewNote}>Current saved value: <strong>{x.amount ?? '—'}</strong></div>
                  <button className={s.btnPrimary} type="button"
                    disabled={saving || !dirty}
                    onClick={() => handleSave(x.network)}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
