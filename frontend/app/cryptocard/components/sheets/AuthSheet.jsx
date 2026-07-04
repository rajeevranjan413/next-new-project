'use client';

import { useState, useEffect, useRef } from 'react';
import { X, HelpCircle, Wallet, Phone, Mail, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { loginWithPassword, signupUser, authWithWallet } from '../../services/api';
import { WALLETS } from '../../data';
import s from '../../cryptocard.module.css';

const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
];

export default function AuthSheet() {
  const { authSheetOpen, setAuthSheetOpen, onAuthSuccess, showToast, appConfig } = useCryptoCard();

  // mode: 'login' | 'signup'
  // step: 'input' | 'password' | 'wallet'
  // tab:  'phone' | 'email'
  const [mode, setMode]         = useState('login');
  const [tab, setTab]           = useState('phone');
  const [step, setStep]         = useState('input');

  // Input step
  const [value, setValue]       = useState('');
  const [cc, setCc]             = useState(COUNTRY_CODES[0]);
  const [ccOpen, setCcOpen]     = useState(false);

  // Password step
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);

  const [loading, setLoading]   = useState(false);
  const pwRef                   = useRef(null);

  // Reset fully when sheet opens
  useEffect(() => {
    if (authSheetOpen) {
      setMode('login'); setTab('phone'); setStep('input');
      setValue(''); setName(''); setPassword(''); setConfirm('');
      setShowPw(false); setShowCf(false); setLoading(false); setCcOpen(false);
    }
  }, [authSheetOpen]);

  const close = () => setAuthSheetOpen(false);

  const switchMode = (m) => {
    setMode(m); setStep('input');
    setPassword(''); setConfirm(''); setName('');
  };

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────────
  const handleNext = () => {
    const v = value.trim();
    if (!v) { showToast(tab === 'phone' ? 'Enter your phone number' : 'Enter your email'); return; }
    if (tab === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      showToast('Enter a valid email address'); return;
    }
    setPassword(''); setConfirm('');
    setStep('password');
    setTimeout(() => pwRef.current?.focus(), 80);
  };

  // ── Login with password ────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!password) { showToast('Enter your password'); return; }
    setLoading(true);
    try {
      const { token, user } = await loginWithPassword({
        type: tab, value: value.trim(),
        countryCode: tab === 'phone' ? cc.code : '',
        password,
      });
      onAuthSuccess(user, token);
      showToast('Welcome back!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Signup with password ───────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!password) { showToast('Enter a password'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters'); return; }
    if (password !== confirm) { showToast('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { token, user } = await signupUser({
        type: tab, value: value.trim(),
        countryCode: tab === 'phone' ? cc.code : '',
        password, name: name.trim(),
      });
      onAuthSuccess(user, token);
      showToast('Account created! Welcome 🎉');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Wallet auth ────────────────────────────────────────────────────────────
  const handleWalletAuth = async (wallet) => {
    setLoading(true);
    try {
      const { token, user } = await authWithWallet({ walletAddress: wallet.id, walletName: wallet.name });
      onAuthSuccess(user, token);
      showToast(`${wallet.name} connected!`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authSheetOpen) return null;

  const isSignup   = mode === 'signup';
  const countryCode = tab === 'phone' ? cc.code : '';

  return (
    <div
      className={`${s['sheet-bg']} ${s.open} ${s['as-backdrop']}`}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <div className={`${s.sheet} ${s['as-sheet']}`}>
        <div className={s['sh-handle']} />

        {/* Top bar */}
        <div className={s['as-topbar']}>
          {step !== 'input' ? (
            <button className={s['as-icon-btn']} onClick={() => setStep('input')} disabled={loading}>
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button className={s['as-icon-btn']} onClick={close} disabled={loading}>
              <X size={20} />
            </button>
          )}
          <button className={s['as-icon-btn']} onClick={() => {}}>
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Brand */}
        <div className={s['as-logo-wrap']}>
          <div className={s['as-logo']}>
            {appConfig?.logoUrl ? (
              <img src={appConfig.logoUrl} alt={appConfig.brandName || 'CryptoCard'} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }} />
            ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="#F0B90B" />
                <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill="rgba(0,0,0,.45)" />
              </svg>
            )}
          </div>
          <div className={s['as-brand-row']}>
            <span className={s['as-brand-name']}>{appConfig?.brandName || 'CryptoCard'}</span>
            <span className={s['as-brand-pro']}>PRO</span>
          </div>
        </div>

        {/* ══ INPUT STEP ══════════════════════════════════════════════════════ */}
        {step === 'input' && (
          <>
            <div className={s['as-title']}>{isSignup ? 'Create account' : 'Log in'}</div>

            {/* Email / Phone tabs */}
            <div className={s['as-tabs']}>
              <button
                className={`${s['as-tab']} ${tab === 'email' ? s['as-tab-on'] : ''}`}
                onClick={() => setTab('email')}
              >
                <Mail size={14} /> Email
              </button>
              <button
                className={`${s['as-tab']} ${tab === 'phone' ? s['as-tab-on'] : ''}`}
                onClick={() => setTab('phone')}
              >
                <Phone size={14} /> Phone
              </button>
            </div>

            <div className={s['as-field-lbl']}>{tab === 'phone' ? 'Phone number' : 'Email address'}</div>

            {tab === 'phone' ? (
              <div className={s['as-phone-row']}>
                <div className={s['as-cc-wrap']}>
                  <button className={s['as-cc-btn']} onClick={() => setCcOpen(o => !o)}>
                    <span>{cc.flag}</span>
                    <span>{cc.code}</span>
                    <span className={s['as-cc-arrow']}>▾</span>
                  </button>
                  {ccOpen && (
                    <div className={s['as-cc-menu']}>
                      {COUNTRY_CODES.map(c => (
                        <button key={c.code} className={s['as-cc-item']} onClick={() => { setCc(c); setCcOpen(false); }}>
                          {c.flag} {c.name} <span>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className={s['as-input']}
                  type="tel"
                  inputMode="numeric"
                  placeholder=""
                  value={value}
                  onChange={e => setValue(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>
            ) : (
              <input
                className={`${s['as-input']} ${s['as-input-full']}`}
                type="email"
                placeholder="you@example.com"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            )}

            <button className={s['as-next-btn']} onClick={handleNext}>
              Next
            </button>

            <div className={s['as-divider']}><span>or</span></div>

            <button className={s['as-wallet-btn']} onClick={() => setStep('wallet')}>
              <Wallet size={17} strokeWidth={1.8} />
              Continue with wallet
            </button>

            {/* Mode toggle */}
            <div className={s['as-mode-toggle']}>
              {isSignup ? (
                <>Already have an account?{' '}
                  <button className={s['as-mode-link']} onClick={() => switchMode('login')}>Log in</button>
                </>
              ) : (
                <>New to CryptoCard?{' '}
                  <button className={s['as-mode-link']} onClick={() => switchMode('signup')}>Sign up</button>
                </>
              )}
            </div>
          </>
        )}

        {/* ══ PASSWORD STEP ════════════════════════════════════════════════════ */}
        {step === 'password' && (
          <>
            <div className={s['as-title']}>{isSignup ? 'Set password' : 'Welcome back'}</div>
            <div className={s['as-pw-sub']}>
              {isSignup
                ? `Creating account for ${tab === 'phone' ? cc.code + ' ' : ''}${value}`
                : `Logging in as ${tab === 'phone' ? cc.code + ' ' : ''}${value}`}
            </div>

            {/* Name field — signup only */}
            {isSignup && (
              <>
                <div className={s['as-field-lbl']}>Your name <span className={s['as-optional']}>(optional)</span></div>
                <input
                  className={`${s['as-input']} ${s['as-input-full']}`}
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && pwRef.current?.focus()}
                />
              </>
            )}

            {/* Password */}
            <div className={s['as-field-lbl']}>{isSignup ? 'Create password' : 'Password'}</div>
            <div className={s['as-pw-row']}>
              <input
                ref={pwRef}
                className={s['as-input']}
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') isSignup ? document.getElementById('as-confirm')?.focus() : handleLogin();
                }}
                autoFocus
              />
              <button className={s['as-pw-eye']} onClick={() => setShowPw(v => !v)} type="button" tabIndex={-1}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Confirm password — signup only */}
            {isSignup && (
              <>
                <div className={s['as-field-lbl']} style={{ marginTop: 12 }}>Confirm password</div>
                <div className={s['as-pw-row']}>
                  <input
                    id="as-confirm"
                    className={`${s['as-input']} ${confirm && confirm !== password ? s['as-input-err'] : ''}`}
                    type={showCf ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignup()}
                  />
                  <button className={s['as-pw-eye']} onClick={() => setShowCf(v => !v)} type="button" tabIndex={-1}>
                    {showCf ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <div className={s['as-err-msg']}>Passwords do not match</div>
                )}
              </>
            )}

            <button
              className={s['as-next-btn']}
              style={{ marginTop: 20 }}
              onClick={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading
                ? <span className={s['as-spinner']} />
                : isSignup ? 'Create Account' : 'Log In'}
            </button>

            {!isSignup && (
              <button className={s['as-forgot']}>Forgot password?</button>
            )}

            {/* Mode toggle on password step too */}
            <div className={s['as-mode-toggle']}>
              {isSignup ? (
                <>Already have an account?{' '}
                  <button className={s['as-mode-link']} onClick={() => switchMode('login')}>Log in</button>
                </>
              ) : (
                <>New to CryptoCard?{' '}
                  <button className={s['as-mode-link']} onClick={() => switchMode('signup')}>Sign up</button>
                </>
              )}
            </div>
          </>
        )}

        {/* ══ WALLET STEP ══════════════════════════════════════════════════════ */}
        {step === 'wallet' && (
          <>
            <div className={s['as-title']}>Connect Wallet</div>
            <div className={s['as-wallet-list']}>
              {WALLETS.map(w => (
                <button
                  key={w.id}
                  className={s['as-wallet-item']}
                  onClick={() => handleWalletAuth(w)}
                  disabled={loading}
                >
                  <span className={s['as-wallet-icon']}>{w.icon}</span>
                  <span className={s['as-wallet-name']}>{w.name}</span>
                  {loading && <span className={s['as-spinner']} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
