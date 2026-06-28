'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { connectWallet as apiConnectWallet, sendChatMessage, authWithWallet, getMe } from './services/api';
import { ACTIVE_THEME, getThemeVars } from './config/theme';

const DEFAULT_CONFIG = {
  brandName: 'CryptoCard Pro',
  tagline: 'Pay with Crypto, Anywhere in the World',
  logoUrl: '', supportEmail: '', supportPhone: '', websiteUrl: '',
  activeTheme: ACTIVE_THEME,
};

const CryptoCardContext = createContext(null);

export function CryptoCardProvider({ children, initialConfig }) {
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState(null);
  const [sheet, setSheet] = useState(null);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('cc_user')); } catch { return null; }
  });
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const postAuthScreen = useRef(null);

  const [time, setTime] = useState('9:41');
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const toastTimer = useRef(null);

  // Card state
  const [applied, setApplied] = useState(false);
  const [genCard, setGenCard] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [chosenWallet, setChosenWallet] = useState('');

  // Apply wizard
  const [step, setStep] = useState(1);
  const [chosenPlan, setChosenPlan] = useState('');
  const [connectedWalletId, setConnectedWalletId] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dob: '',
    countryCode: '+91', phone: '', country: '',
  });

  // Profile
  const [profName, setProfName] = useState('Guest User');
  const [profEmail, setProfEmail] = useState('Apply to create your account');
  const [profInitial, setProfInitial] = useState('G');
  const [lang, setLangCode] = useState('EN');
  const [dir, setDir] = useState('ltr');
  const [selectedCountry, setSelectedCountry] = useState('India');

  // ── App config — server-provided, no client fetching needed
  const [appConfig, setAppConfig] = useState(initialConfig ?? DEFAULT_CONFIG);
  const [activeTheme, setActiveTheme] = useState(
    (initialConfig ?? DEFAULT_CONFIG).activeTheme
  );
  const cssVars = getThemeVars(activeTheme);

  // Support
  const [supportTab, setSupportTab] = useState('tg');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Physical card
  const [physType, setPhysType] = useState(null);
  const [cardType, setCardType] = useState('virtual');
  const [cardTheme, setCardTheme] = useState('classic');

  // Chat
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Namaste! 👋 Main CryptoCard Pro ka AI expert assistant hoon.\n\nAap mujhse Card ke fayde, Wallet safety, 10% cashback ya $100 USDT welcome bonus ke baare me kuch bhi Hinglish ya Hindi me pooch sakte hain! 😊' },
  ]);
  const [chatTyping, setChatTyping] = useState(false);

  // Demo animation
  const [demoStep, setDemoStep] = useState(0);

  // Stats
  const [stats, setStats] = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const statsAnimated = useRef(false);

  // Home balance display
  const [hBal, setHBal] = useState('— USDT');
  const [hWallet, setHWallet] = useState('—');
  const [hWTag, setHWTag] = useState('CONNECT');
  const [hVouch, setHVouch] = useState('100 USDT');
  const [hVTag, setHVTag] = useState('LOCKED');
  const [hVTagStyle, setHVTagStyle] = useState({ background: 'var(--gbg)', color: 'var(--green)' });
  const [hWTagStyle, setHWTagStyle] = useState({ background: 'var(--bnbg)', color: 'var(--bnb)' });
  const [connectingWalletId, setConnectingWalletId] = useState(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const h = n.getHours() % 12 || 12;
      const m = String(n.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Verify stored token on mount & refresh user data ──────────────────────
  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('cc_token');
    if (!token) return;
    getMe(token)
      .then(({ user: fresh }) => {
        setUser(fresh);
        try { localStorage.setItem('cc_user', JSON.stringify(fresh)); } catch {}
      })
      .catch(() => {
        // Token expired or invalid — clear session silently
        setUser(null);
        try { localStorage.removeItem('cc_user'); localStorage.removeItem('cc_token'); } catch {}
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pre-fill profile + apply form whenever user changes ───────────────────
  useEffect(() => {
    if (!user) return;

    // Profile panel
    const displayName = user.name || user.email || (user.phone ? `${user.countryCode || ''} ${user.phone}` : '') || 'User';
    const displaySub  = user.email || (user.phone ? `${user.countryCode || ''} ${user.phone}` : '') || 'Account created';
    const initial     = displayName.trim()[0]?.toUpperCase() || 'U';
    setProfName(displayName);
    setProfEmail(displaySub);
    setProfInitial(initial);

    // Apply wizard — Step 1 form
    const parts     = (user.name || '').trim().split(' ');
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';
    setForm(f => ({
      ...f,
      firstName:   firstName  || f.firstName,
      lastName:    lastName   || f.lastName,
      email:       user.email || f.email,
      phone:       user.phone || f.phone,
      countryCode: user.countryCode || f.countryCode,
    }));
  }, [user]);

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, msg });
    toastTimer.current = setTimeout(() => setToast({ visible: false, msg: '' }), 2200);
  }, []);

  const [screenFlash, setScreenFlash] = useState(null);
  const flashTimer = useRef(null);

  const PROTECTED_SCREENS = ['apply'];

  const navigateToScreen = useCallback((name) => {
    if (name === screen) {
      clearTimeout(flashTimer.current);
      setScreenFlash(name);
      flashTimer.current = setTimeout(() => setScreenFlash(null), 600);
      return;
    }
    setPrevScreen(screen);
    setScreen(name);
    if (name === 'apply') {
      setStep(1);
      setChosenPlan('');
      setConnectedWalletId('');
      setTermsChecked(false);
    }
  }, [screen]);

  const goScreen = useCallback((name) => {
    if (['apply'].includes(name) && !user) {
      postAuthScreen.current = name;
      setAuthSheetOpen(true);
      return;
    }
    navigateToScreen(name);
  }, [screen, user, navigateToScreen]);

  const openSheet = useCallback((name) => setSheet(name), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const onAuthSuccess = useCallback((userData, token) => {
    setUser(userData);
    try {
      localStorage.setItem('cc_user', JSON.stringify(userData));
      if (token) localStorage.setItem('cc_token', token);
    } catch {}
    setAuthSheetOpen(false);
    if (postAuthScreen.current) {
      navigateToScreen(postAuthScreen.current);
      postAuthScreen.current = null;
    }
  }, [navigateToScreen]);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem('cc_user'); localStorage.removeItem('cc_token'); } catch {}
  }, []);

  const animateStats = useCallback(() => {
    if (statsAnimated.current) return;
    statsAnimated.current = true;
    const targets = { s1: 284700, s2: 190, s3: 94200, s4: 180000 };
    const steps = 60;
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      const p = Math.min(tick / steps, 1);
      setStats({
        s1: Math.floor(targets.s1 * p),
        s2: Math.floor(targets.s2 * p),
        s3: Math.floor(targets.s3 * p),
        s4: Math.floor(targets.s4 * p),
      });
      if (tick >= steps) clearInterval(id);
    }, 18);
  }, []);

  const pickWallet = useCallback(async (wallet) => {
    setConnectingWalletId(wallet.id);
    try {
      const { balance: bal } = await apiConnectWallet(wallet);
      setConnectedWalletId(wallet.id);
      setHBal(`${bal} USDT`);
      setHWallet(bal);
      setHWTag('LIVE');
      setHWTagStyle({ background: 'var(--gbg)', color: 'var(--green)' });
      setHVouch('100 USDT');
      setHVTag('PENDING');
      setHVTagStyle({ background: 'var(--bnbg)', color: 'var(--bnb)' });
      setWalletBalance(bal);
      setChosenWallet(wallet.name);
      showToast(`${wallet.name} connected!`);
    } finally {
      setConnectingWalletId(null);
    }
  }, [showToast]);

  const genCardData = useCallback(() => {
    const num = [
      4729,
      Math.floor(1000 + Math.random() * 9000),
      Math.floor(1000 + Math.random() * 9000),
      Math.floor(1000 + Math.random() * 9000),
    ].join(' ');
    const cvv = String(Math.floor(100 + Math.random() * 900));
    const y = (new Date().getFullYear() + 4) % 100;
    const exp = `0${Math.floor(Math.random() * 12) + 1}/${y}`;
    const holder = `${form.firstName} ${form.lastName}`.trim().toUpperCase() || 'CARD HOLDER';
    return { num, cvv, exp, holder };
  }, [form.firstName, form.lastName]);

  const showCard = useCallback(() => {
    const card = genCardData();
    setGenCard(card);
    setApplied(true);
    const bal = walletBalance || (200 + Math.floor(Math.random() * 400)).toFixed(2);
    setHBal(`${bal} USDT`);
    goScreen('card');
  }, [genCardData, walletBalance, goScreen]);

  const copyVal = useCallback((val, msg) => {
    navigator.clipboard.writeText(val).catch(() => {});
    showToast(msg);
  }, [showToast]);

  const nextStep = useCallback((from) => {
    if (from === 1) {
      const { firstName, lastName, email, phone, country } = form;
      if (!firstName || !lastName || !email || !phone || !country) {
        showToast('Please fill all fields!');
        return;
      }
      setProfName(`${firstName} ${lastName}`);
      setProfEmail(email);
      setProfInitial(firstName[0].toUpperCase());
    }
    if (from === 2 && !chosenPlan) {
      showToast('Please select a plan!');
      return;
    }
    if (from === 4) {
      if (!connectedWalletId) { showToast('Please connect a wallet!'); return; }
      if (!termsChecked) { showToast('Please accept Terms & Conditions!'); return; }
    }
    setStep(s => Math.min(s + 1, 5));
  }, [form, chosenPlan, connectedWalletId, termsChecked, showToast]);

  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  const sendChat = useCallback(async (msg) => {
    if (!msg.trim()) return;
    setChatMessages(m => [...m, { type: 'user', text: msg }]);
    setChatTyping(true);
    try {
      const data = await sendChatMessage(msg);
      setChatMessages(m => [...m, { type: 'bot', text: data.reply || 'Connection issue. Try again or submit a support ticket! 🙏' }]);
    } catch {
      setChatMessages(m => [...m, { type: 'bot', text: 'Connection issue. Try again or submit a support ticket! 🙏' }]);
    } finally {
      setChatTyping(false);
    }
  }, []);

  const value = {
    screen, goScreen, prevScreen, screenFlash,
    connectingWalletId,
    sheet, openSheet, closeSheet,
    user, authSheetOpen, setAuthSheetOpen, onAuthSuccess, logout,
    time, toast, showToast,
    applied, genCard, walletBalance, chosenWallet,
    step, setStep, chosenPlan, setChosenPlan,
    cardType, setCardType, cardTheme, setCardTheme,
    connectedWalletId, pickWallet,
    termsChecked, setTermsChecked,
    form, setForm,
    profName, profEmail, profInitial,
    lang, setLangCode, dir, setDir,
    selectedCountry, setSelectedCountry,
    supportTab, setSupportTab,
    ticketSubmitted, setTicketSubmitted,
    physType, setPhysType,
    chatMessages, chatTyping, sendChat,
    demoStep, setDemoStep,
    stats, animateStats,
    hBal, hWallet, hWTag, hWTagStyle, hVouch, hVTag, hVTagStyle,
    nextStep, prevStep, showCard, copyVal,
    activeTheme, setActiveTheme, cssVars, appConfig,
  };

  return (
    <CryptoCardContext.Provider value={value}>
      {children}
    </CryptoCardContext.Provider>
  );
}

export const useCryptoCard = () => useContext(CryptoCardContext);
