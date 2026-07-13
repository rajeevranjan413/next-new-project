'use client';

import { useState, useEffect } from 'react';
import s from '../admin.module.css';
import { apiGetConfig, apiSaveConfig } from '../lib/api.js';
import { Toast } from '../components/Toast.jsx';
import { useToast } from '../lib/useToast.js';

export function BrandPanel({ token }) {
  const [cfg, setCfg] = useState({ brandName: '', tagline: '', supportEmail: '', supportPhone: '', websiteUrl: '' });
  const [saving, setSaving] = useState(false);
  const [toastMsg, showToast] = useToast();

  useEffect(() => { apiGetConfig().then(c => { if (c) setCfg(prev => ({ ...prev, ...c })); }).catch(() => {}); }, []);

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await apiSaveConfig(token, {
        brandName: cfg.brandName, tagline: cfg.tagline,
        supportEmail: cfg.supportEmail, supportPhone: cfg.supportPhone,
        websiteUrl: cfg.websiteUrl,
      });
      setCfg(prev => ({ ...prev, ...updated }));
      showToast('Brand info saved — frontend will reflect changes on next load');
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className={s.fieldGroup}>
      <label className={s.label}>{label}</label>
      <input className={s.input} type={type} placeholder={placeholder}
        value={cfg[key] || ''} onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Brand Info</h2>
        <p className={s.panelSub}>These values are consumed across the frontend app — header, auth sheet, hero section, support sheet</p>
      </div>

      <form className={s.card} onSubmit={handleSave}>
        <div className={s.cardHead}>
          <div className={s.cardTitle}>Identity</div>
          <div className={s.cardSub}>Displayed in app header, login screen and web nav</div>
        </div>
        <div className={s.formGrid}>
          {field('brandName',   'Brand Name',  'text',  'CryptoCard Pro')}
          {field('tagline',     'Tagline',     'text',  'Pay with Crypto, Anywhere in the World')}
          {field('websiteUrl',  'Website URL', 'url',   'https://cryptocard.com')}
        </div>

        <div className={s.cardTitle} style={{ marginTop: 24, marginBottom: 4 }}>Support Contact</div>
        <div className={s.cardSub} style={{ marginBottom: 16 }}>Shown in the in-app support sheet</div>
        <div className={s.formGrid}>
          {field('supportEmail', 'Support Email', 'email', 'support@cryptocard.com')}
          {field('supportPhone', 'Support Phone', 'text',  '+1 234 567 8900')}
        </div>

        <div className={s.cardFooter}>
          <div className={s.previewNote}>
            <strong>Frontend usage:</strong> brand name → header & auth login · tagline → hero section · support email/phone → support sheet
          </div>
          <button className={s.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
