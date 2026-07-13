'use client';

import { useState, useEffect, useRef } from 'react';
import s from '../admin.module.css';
import { apiGetConfig, apiSaveConfig, apiUploadLogo } from '../lib/api.js';
import { THEME_REGISTRY } from '../lib/constants.js';
import { Toast } from '../components/Toast.jsx';
import { useToast } from '../lib/useToast.js';

export function AppearancePanel({ token }) {
  const [cfg, setCfg] = useState({});
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(null);
  const [toastMsg, showToast] = useToast();
  const fileRef = useRef(null);

  useEffect(() => { apiGetConfig().then(c => { setCfg(c); setPreview(c?.logoUrl || null); }).catch(() => {}); }, []);

  async function handleThemeSelect(key) {
    if (key === cfg.activeTheme || themeLoading) return;
    setThemeLoading(key);
    try {
      const updated = await apiSaveConfig(token, { activeTheme: key });
      setCfg(updated); showToast(`Theme set to "${key}" — frontend will update on next load`);
    } catch (e) { showToast('Error: ' + e.message); }
    finally { setThemeLoading(null); }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { config } = await apiUploadLogo(token, file);
      setCfg(config); setPreview(config.logoUrl);
      showToast('Logo uploaded — frontend will use it on next load');
    } catch (e) { showToast('Upload error: ' + e.message); setPreview(cfg.logoUrl || null); }
    finally { setUploading(false); }
  }

  async function handleRemoveLogo() {
    try {
      const updated = await apiSaveConfig(token, { logoUrl: '' });
      setCfg(updated); setPreview(null);
      showToast('Logo removed — frontend will revert to default');
    } catch (e) { showToast('Error: ' + e.message); }
  }

  return (
    <div className={s.panel}>
      <Toast msg={toastMsg} />
      <div className={s.panelHead}>
        <h2 className={s.panelTitle}>Appearance</h2>
        <p className={s.panelSub}>Controls theme and logo across the entire frontend app</p>
      </div>

      {/* Logo */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>Brand Logo</div>
            <div className={s.cardSub}>PNG / JPG / SVG · max 5 MB · shown in app header and login screen</div>
          </div>
        </div>
        <div className={s.logoRow}>
          <div className={s.logoBox}>
            {preview ? <img src={preview} alt="logo" className={s.logoImg} /> : (
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" opacity=".3">
                <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
                <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="#000" />
              </svg>
            )}
            {uploading && <div className={s.logoOverlay}>Uploading…</div>}
          </div>
          <div className={s.logoActions}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            <button className={s.btnPrimary} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload logo'}
            </button>
            {cfg.logoUrl && <button className={s.btnDanger} onClick={handleRemoveLogo}>Remove</button>}
            {cfg.logoUrl && <a href={cfg.logoUrl} target="_blank" rel="noreferrer" className={s.linkSmall}>View current ↗</a>}
          </div>
        </div>
      </div>

      {/* Theme picker */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <div>
            <div className={s.cardTitle}>App Theme</div>
            <div className={s.cardSub}>Active: <strong>{cfg.activeTheme || 'light'}</strong> · Changes apply on frontend next page load</div>
          </div>
        </div>
        <div className={s.themeGrid}>
          {THEME_REGISTRY.map(t => {
            const isActive  = (cfg.activeTheme || 'light') === t.key;
            const isLoading = themeLoading === t.key;
            return (
              <button key={t.key}
                className={s.themeCard + (isActive ? ' ' + s.themeCardActive : '')}
                onClick={() => handleThemeSelect(t.key)}
                disabled={!!themeLoading}
              >
                <div className={s.themePreview} style={{ background: t.bg }}>
                  <div className={s.tpSurface} style={{ background: t.surface }}>
                    <div className={s.tpDot} style={{ background: t.accent }} />
                    <div className={s.tpBar}  style={{ background: t.text, opacity: .35 }} />
                    <div className={s.tpBar2} style={{ background: t.text, opacity: .2 }} />
                  </div>
                </div>
                <div className={s.themeInfo}>
                  <span className={s.themeName} style={{ color: isActive ? '#6366f1' : undefined }}>{t.label}</span>
                  <span className={s.themeDesc}>{t.desc}</span>
                </div>
                {isActive && !isLoading && <span className={s.themeCheck}>✓</span>}
                {isLoading && <span className={s.themeSpinner} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
