'use client';

import { useState } from 'react';
import s from '../admin.module.css';
import { apiLogin } from '../lib/api.js';

// Admin sign-in. Calls back with (token, username) on success.
export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try { const { token, username: u } = await apiLogin(username, password); onLogin(token, u); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className={s.loginWrap}>
      <form className={s.loginCard} onSubmit={submit}>
        <div className={s.loginLogo}>
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
            <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="rgba(0,0,0,.4)" />
          </svg>
          <div>
            <div className={s.loginBrand}>CryptoCard</div>
            <div className={s.loginSubtitle}>Admin Panel</div>
          </div>
        </div>
        <div className={s.fieldGroup}>
          <label className={s.label}>Username</label>
          <input className={s.input} type="text" autoComplete="username" placeholder="admin"
            value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={s.fieldGroup}>
          <label className={s.label}>Password</label>
          <div className={s.inputWrap}>
            <input className={s.input} type={showPw ? 'text' : 'password'} autoComplete="current-password"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {err && <div className={s.loginErr}>{err}</div>}
        <button className={s.btnPrimary} style={{ width: '100%', padding: '12px' }} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
