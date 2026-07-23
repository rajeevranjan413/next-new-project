'use client';

import { useState, useEffect, useRef } from 'react';
import s from '../admin.module.css';
import { apiGetConfig, apiSaveConfig, apiUploadPayLogo } from '../lib/api.js';
import { Toast } from '../components/Toast.jsx';
import { useToast } from '../lib/useToast.js';

const EMPTY = {
  walletTron: '', walletBnb: '',
  connectWallet: { enabled: false, text: '', logoUrl: '', url: '' },
};

export function PaymentsPanel({ token }) {
  const [pay, setPay] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [toastMsg, showToast] = useToast();
  const fileRef = useRef(null);

  useEffect(() => {
    apiGetConfig().then(c => {
      if (c?.payment) {
        const p = { ...EMPTY, ...c.payment, connectWallet: { ...EMPTY.connectWallet, ...(c.payment.connectWallet || {}) } };
        setPay(p);
        setPreview(p.connectWallet.logoUrl || null);
      }
    }).catch(() => {});
  }, []);

  const setAddr = (key, val) => setPay(p => ({ ...p, [key]: val }));
  const setCw   = (key, val) => setPay(p => ({ ...p, connectWallet: { ...p.connectWallet, [key]: val } }));

  // Persists text fields. Omits connectWallet.logoUrl so the separately-uploaded
  // logo is preserved by the backend.
  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await apiSaveConfig(token, {
        payment: {
          walletTron: pay.walletTron.trim(),
          walletBnb:  pay.walletBnb.trim(),
          connectWallet: {
            enabled: pay.connectWallet.enabled,
            text:    pay.connectWallet.text,
            url:     pay.connectWallet.url,
          },
        },
      });
      if (updated?.payment) {
        const p = { ...EMPTY, ...updated.payment, connectWallet: { ...EMPTY.connectWallet, ...(updated.payment.connectWallet || {}) } };
        setPay(p); setPreview(p.connectWallet.logoUrl || null);
      }
      showToast('Payment settings saved — frontend updates on next load');
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { config } = await apiUploadPayLogo(token, file);
      const url = config?.payment?.connectWallet?.logoUrl || '';
      setCw('logoUrl', url); setPreview(url || null);
      showToast('Button logo uploaded — frontend will use it on next load');
    } catch (e) { showToast('Upload error: ' + e.message); setPreview(pay.connectWallet.logoUrl || null); }
    finally { setUploading(false); }
  }

  // Clears the logo via an explicit empty string (the backend honors it).
  async function handleRemoveLogo() {
    try {
      const updated = await apiSaveConfig(token, {
        payment: {
          walletTron: pay.walletTron.trim(),
          walletBnb:  pay.walletBnb.trim(),
          connectWallet: {
            enabled: pay.connectWallet.enabled,
            text:    pay.connectWallet.text,
            url:     pay.connectWallet.url,
            logoUrl: '',
          },
        },
      });
      const p = { ...EMPTY, ...(updated?.payment || {}), connectWallet: { ...EMPTY.connectWallet, ...(updated?.payment?.connectWallet || {}) } };
      setPay(p); setPreview(null);
      showToast('Button logo removed');
    } catch (e) { showToast('Error: ' + e.message); }
  }

  const cw = pay.connectWallet;

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Payments</h2>
        <p className={s.panelSub}>Receiving wallet addresses and the “Connect wallet” button — used by both the physical-card order and Add Funds payment sheets.</p>
      </div>

      <form className={s.card} onSubmit={handleSave}>
        {/* Receiving addresses */}
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>Receiving Wallet Addresses</div>
            <div className={s.cardSub}>Shown to the customer on the payment sheet. Leave blank to use an auto-generated one-time address.</div>
          </div>
        </div>
        <div className={s.formGrid}>
          <div className={s.fieldGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={s.label}>USDT · Tron (TRC-20) address</label>
            <input className={s.input} type="text" placeholder="T…"
              value={pay.walletTron} onChange={e => setAddr('walletTron', e.target.value)} />
          </div>
          <div className={s.fieldGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={s.label}>USDT · BNB Smart Chain (BEP-20) address</label>
            <input className={s.input} type="text" placeholder="0x…"
              value={pay.walletBnb} onChange={e => setAddr('walletBnb', e.target.value)} />
          </div>
        </div>

        {/* Connect wallet button */}
        <div className={s.cardHead} style={{ marginTop: 26 }}>
          <div>
            <div className={s.cardTitle}>“Connect Wallet” Button</div>
            <div className={s.cardSub}>Turn on to show a button that opens your wallet-connect URL in a new tab</div>
          </div>
          <button type="button" role="switch" aria-checked={cw.enabled}
            onClick={() => setCw('enabled', !cw.enabled)}
            style={{
              width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
              position: 'relative', flexShrink: 0,
              background: cw.enabled ? '#6366f1' : '#d1d5db', transition: 'background .2s',
            }}>
            <span style={{
              position: 'absolute', top: 3, left: cw.enabled ? 23 : 3, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }} />
          </button>
        </div>

        <div className={s.formGrid}>
          <div className={s.fieldGroup}>
            <label className={s.label}>Button text</label>
            <input className={s.input} type="text" placeholder="Connect wallet"
              value={cw.text} onChange={e => setCw('text', e.target.value)} />
          </div>
          <div className={s.fieldGroup}>
            <label className={s.label}>Button URL (opens on click)</label>
            <input className={s.input} type="url" placeholder="https://…"
              value={cw.url} onChange={e => setCw('url', e.target.value)} />
          </div>
        </div>

        {/* Button logo upload */}
        <div className={s.cardSub} style={{ margin: '18px 0 10px' }}>Button logo · PNG / JPG / SVG · max 5 MB</div>
        <div className={s.logoRow}>
          <div className={s.logoBox}>
            {preview ? <img src={preview} alt="button logo" className={s.logoImg} /> : (
              <svg width="26" height="26" viewBox="0 0 20 20" fill="#9ca3af" opacity=".4"><path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm11 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
            )}
            {uploading && <div className={s.logoOverlay}>Uploading…</div>}
          </div>
          <div className={s.logoActions}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            <button type="button" className={s.btnPrimary} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : (cw.logoUrl ? 'Replace logo' : 'Upload logo')}
            </button>
            {cw.logoUrl && <button type="button" className={s.btnDanger} onClick={handleRemoveLogo}>Remove</button>}
            {cw.logoUrl && <a href={cw.logoUrl} target="_blank" rel="noreferrer" className={s.linkSmall}>View current ↗</a>}
          </div>
        </div>

        <div className={s.cardFooter}>
          <div className={s.previewNote}>
            <strong>Note:</strong> addresses and button text/URL apply on the customer’s next page load. The logo saves immediately on upload.
          </div>
          <button className={s.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
