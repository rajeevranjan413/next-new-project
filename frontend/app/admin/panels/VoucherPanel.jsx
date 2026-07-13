'use client';

import { useState, useEffect } from 'react';
import s from '../admin.module.css';
import { apiGetConfig, apiSaveConfig } from '../lib/api.js';
import { VOUCHER_PLACEHOLDERS } from '../lib/constants.js';
import { Toast } from '../components/Toast.jsx';
import { useToast } from '../lib/useToast.js';

export function VoucherPanel({ token }) {
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
