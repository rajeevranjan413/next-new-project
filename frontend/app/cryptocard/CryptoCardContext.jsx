'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { connectWallet as apiConnectWallet, authWithWallet, getMe } from './services/api';
import { getBotReply } from './services/chatbot';
import { detectCountry } from './services/geo';
import { WORLD_COUNTRIES } from './config/content';
import { COUNTRIES } from './config/languages';
import { ACTIVE_THEME, getThemeVars } from './config/theme';

const DEFAULT_CONFIG = {
  brandName: 'CryptoCard Pro',
  tagline: 'Pay with Crypto, Anywhere in the World',
  logoUrl: '', supportEmail: '', supportPhone: '', websiteUrl: '',
  activeTheme: ACTIVE_THEME,
  voucher: {
    enabled: true, limitedText: '', title: '', highlight: '', subtitle: '',
    amount: '', bonusNote: '', offerMinutes: 15, ctaText: '', slots: 47, skipText: '',
  },
};

const CryptoCardContext = createContext(null);

export function CryptoCardProvider({ children, initialConfig }) {
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

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
  // Personal details captured from the apply-form Step 1, surfaced on the Profile tab.
  const [profileDetails, setProfileDetails] = useState(null);
  const [lang, setLangCode] = useState('EN');
  const [dir, setDir] = useState('ltr');
  const [selectedCountry, setSelectedCountry] = useState('India');

  // Geo — country auto-detected from the visitor's IP (see services/geo.js).
  const [geo, setGeo] = useState(null);
  const geoAppliedRef = useRef(false);

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
    { type: 'bot', text: "Hi there! 👋 I'm CryptoCard Pro's AI assistant.\n\nAsk me anything about card benefits, wallet safety, 10% cashback or the $100 USDT welcome bonus — I'm here to help! 😊" },
  ]);
  const [chatTyping, setChatTyping] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const chatBusyRef = useRef(false);

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

  // ── Auto-detect country + phone code from the visitor's IP (once, on mount) ──
  useEffect(() => {
    detectCountry().then((iso) => {
      if (!iso) return;
      const match = WORLD_COUNTRIES.find((c) => c.iso === iso);
      if (match) setGeo(match);
    });
  }, []);

  // Apply the detected country everywhere it's used as a default — but never
  // clobber a value the user (or their saved profile) has already provided.
  // '+91'/'India' are the app's hardcoded defaults, so they count as "unset".
  useEffect(() => {
    if (!geo || geoAppliedRef.current) return;
    geoAppliedRef.current = true;

    // The Profile region picker uses the COUNTRIES dataset, whose names differ
    // slightly (e.g. "UAE" vs "United Arab Emirates"); match on flag so its
    // highlighted selection + chip line up. The apply form uses WORLD_COUNTRIES
    // names, so it keeps geo.name.
    const regionName = (COUNTRIES.find((c) => c.flag === geo.flag) || {}).name || geo.name;

    setSelectedCountry((prev) => (!prev || prev === 'India' ? regionName : prev));
    setForm((f) => ({
      ...f,
      countryCode: !f.countryCode || f.countryCode === '+91' ? geo.dial : f.countryCode,
      country:     f.country || geo.name,
    }));
  }, [geo]);

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

  const openVoucher = useCallback(() => setVoucherOpen(true), []);
  const closeVoucher = useCallback(() => setVoucherOpen(false), []);

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
    setProfileDetails(null);
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
      setProfileDetails({ ...form });
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

  // Local, static AI support. getBotReply() picks a business-accurate answer from
  // services/chatbot.js; here we add the human feel — a short "thinking" pause with
  // the typing dots, then the reply streamed in word-by-word like a live agent.
  // chatBusyRef guards against overlapping sends (rapid taps / quick-reply spam).
  const sendChat = useCallback(async (msg) => {
    const text = msg.trim();
    if (!text || chatBusyRef.current) return;
    chatBusyRef.current = true;
    setChatBusy(true);
    setChatMessages(m => [...m, { type: 'user', text }]);
    setChatTyping(true);

    const reply = getBotReply(text);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // "Thinking" pause scales a little with answer length, capped so it never drags.
    await sleep(500 + Math.min(1500, reply.length * 9));
    setChatTyping(false);

    // Stream the answer word-by-word into a single growing bot bubble.
    setChatMessages(m => [...m, { type: 'bot', text: '' }]);
    const words = reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      await sleep(22 + Math.random() * 34);
      const partial = words.slice(0, i + 1).join(' ');
      setChatMessages(m => {
        const copy = m.slice();
        copy[copy.length - 1] = { type: 'bot', text: partial };
        return copy;
      });
    }

    chatBusyRef.current = false;
    setChatBusy(false);
  }, []);

  const value = {
    screen, goScreen, prevScreen, screenFlash,
    connectingWalletId,
    sheet, openSheet, closeSheet,
    voucherOpen, openVoucher, closeVoucher,
    user, authSheetOpen, setAuthSheetOpen, onAuthSuccess, logout,
    time, toast, showToast,
    applied, genCard, walletBalance, chosenWallet,
    step, setStep, chosenPlan, setChosenPlan,
    cardType, setCardType, cardTheme, setCardTheme,
    connectedWalletId, pickWallet,
    termsChecked, setTermsChecked,
    form, setForm,
    profName, profEmail, profInitial, profileDetails,
    lang, setLangCode, dir, setDir,
    selectedCountry, setSelectedCountry, geo,
    supportTab, setSupportTab,
    ticketSubmitted, setTicketSubmitted,
    physType, setPhysType,
    chatMessages, chatTyping, chatBusy, sendChat,
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
