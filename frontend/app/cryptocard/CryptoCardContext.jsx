'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { connectWallet as apiConnectWallet, authWithWallet, getMe, applyForCard, getMyCards, submitFundRequest as apiSubmitFundRequest } from './services/api';
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
  payment: {
    walletTron: '', walletBnb: '',
    connectWallet: { enabled: false, text: '', logoUrl: '', url: '' },
  },
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
  // Info popup shown when the user taps a Voucher/Reward balance or button.
  // null | 'voucher' | 'rewards'
  const [infoOpen, setInfoOpen] = useState(null);

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
  const [applying, setApplying] = useState(false);
  const [genCard, setGenCard] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [chosenWallet, setChosenWallet] = useState('');
  // Spendable wallet balance (USDT). Source of truth is the backend `walletBalance`,
  // credited only when an admin approves an Add-Funds request. Mirrored here from the
  // logged-in user so the Home/Card tiles show it; reset on logout.
  const [walletFunds, setWalletFunds] = useState(0);

  // Apply wizard
  const [step, setStep] = useState(1);
  const [chosenPlan, setChosenPlan] = useState('');
  const [connectedWalletId, setConnectedWalletId] = useState('');
  // Blockchain network the card settles on (see config/chains.js). Picked on Step 4.
  const [selectedChain, setSelectedChain] = useState('');
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
      setSelectedChain('');
      setTermsChecked(false);
    }
  }, [screen]);

  const goScreen = useCallback((name) => {
    if (name === 'apply') {
      // Applying requires an account…
      if (!user) {
        postAuthScreen.current = name;
        setAuthSheetOpen(true);
        return;
      }
      // …and only once. A user who already holds a card is sent to it instead of
      // re-running the wizard (the backend reuses the card, but the UX shouldn't
      // invite re-applying).
      if (applied) {
        showToast('You already have a CryptoCard!');
        navigateToScreen('card');
        return;
      }
    }
    navigateToScreen(name);
  }, [user, applied, navigateToScreen, showToast]);

  const openSheet = useCallback((name) => setSheet(name), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const openVoucher = useCallback(() => setVoucherOpen(true), []);
  const closeVoucher = useCallback(() => setVoucherOpen(false), []);

  const openInfo = useCallback((type) => setInfoOpen(type), []);
  const closeInfo = useCallback(() => setInfoOpen(null), []);

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
    // Clear the issued-card state so the next account starts fresh — otherwise the
    // apply gate would wrongly treat a new user as already holding a card.
    setApplied(false);
    setGenCard(null);
    // Clear the wallet/balance display so the next account doesn't inherit it.
    setConnectedWalletId('');
    setWalletBalance(null);
    setChosenWallet('');
    setWalletFunds(0);
    setHBal('— USDT');
    setHWallet('—');
    setHWTag('CONNECT');
    setHWTagStyle({ background: 'var(--bnbg)', color: 'var(--bnb)' });
    setHVouch('100 USDT');
    setHVTag('LOCKED');
    try {
      localStorage.removeItem('cc_user'); localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_last_order'); localStorage.removeItem('cc_wallet');
      localStorage.removeItem('cc_funds');
    } catch {}
  }, []);

  // Re-pull the logged-in user from the backend so a freshly-approved Add-Funds
  // credit surfaces (walletBalance → walletFunds via the mirror effect below).
  // No-op for guests. Called when the Add Funds sheet opens.
  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' && localStorage.getItem('cc_token');
    if (!token) return null;
    try {
      const { user: fresh } = await getMe(token);
      setUser(fresh);
      try { localStorage.setItem('cc_user', JSON.stringify(fresh)); } catch {}
      return fresh;
    } catch {
      return null;
    }
  }, []);

  // Raise an Add-Funds request. The wallet is NOT credited here — the request stays
  // pending until an admin approves it in the panel. Returns the created request.
  const submitFundRequest = useCallback(async ({ amount, network, payAddress }) => {
    const token = typeof window !== 'undefined' && localStorage.getItem('cc_token');
    if (!token) throw new Error('Please log in to add funds');
    return apiSubmitFundRequest({ amount, network, payAddress }, token);
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

  // Pushes a connected wallet's balance into every place it's displayed (home tiles,
  // card balance). Shared by a live connect and by the reload-restore path below.
  const applyWalletDisplay = useCallback((walletId, walletName, bal) => {
    setConnectedWalletId(walletId);
    setHBal(`${bal} USDT`);
    setHWallet(bal);
    setHWTag('LIVE');
    setHWTagStyle({ background: 'var(--gbg)', color: 'var(--green)' });
    setHVouch('100 USDT');
    setHVTag('PENDING');
    setHVTagStyle({ background: 'var(--bnbg)', color: 'var(--bnb)' });
    setWalletBalance(bal);
    setChosenWallet(walletName);
  }, []);

  const pickWallet = useCallback(async (wallet) => {
    setConnectingWalletId(wallet.id);
    try {
      const { balance: bal } = await apiConnectWallet(wallet);
      applyWalletDisplay(wallet.id, wallet.name, bal);
      // Persist so the balance survives a page reload (see restore effect below).
      try { localStorage.setItem('cc_wallet', JSON.stringify({ id: wallet.id, name: wallet.name, balance: bal })); } catch {}
      showToast(`${wallet.name} connected!`);
    } finally {
      setConnectingWalletId(null);
    }
  }, [showToast, applyWalletDisplay]);

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

  // Issues (or refreshes) the user's card and stashes it in `genCard` so its real
  // number/holder can be shown. The backend `/apply` is idempotent, so calling this at
  // the Done step (to preview the card) and again on "View Card" returns the same card.
  // Falls back to a locally generated card if the API is down so the flow never dead-ends.
  // It deliberately does NOT flip `applied` — that flag redirects away from the wizard
  // (see ApplyScreen), so we only set it once the user taps through to their card.
  const issueCard = useCallback(async () => {
    // Already generated (e.g. previewed on the Done step) — reuse it so the number the
    // user saw doesn't change, and skip a redundant backend round-trip.
    if (genCard) return genCard;
    const token = typeof window !== 'undefined' && localStorage.getItem('cc_token');
    const holder = `${form.firstName} ${form.lastName}`.trim().toUpperCase() || 'CARD HOLDER';
    setApplying(true);
    try {
      let card = null;
      if (token) {
        card = await applyForCard(
          { plan: chosenPlan || 'Mool', theme: cardTheme, cardType, holder },
          token
        );
      }
      const data = card
        ? { num: card.num, cvv: card.cvv, exp: card.exp, holder: card.holder }
        : genCardData();
      setGenCard(data);
      return data;
    } catch {
      const data = genCardData(); // backend unreachable — local fallback
      setGenCard(data);
      return data;
    } finally {
      setApplying(false);
    }
  }, [genCard, genCardData, chosenPlan, cardTheme, cardType, form.firstName, form.lastName]);

  // Completes the apply flow: ensures the card is issued, then reveals it on the Card
  // screen. Marks the application complete so the wizard can't be re-run.
  const showCard = useCallback(async () => {
    await issueCard();
    setApplied(true);
    const bal = walletBalance || (200 + Math.floor(Math.random() * 400)).toFixed(2);
    setHBal(`${bal} USDT`);
    goScreen('card');
  }, [issueCard, walletBalance, goScreen]);

  // Restore an already-issued card whenever we have a logged-in session, so the card
  // survives page reloads instead of being lost with the client-only state.
  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('cc_token');
    if (!token || !user) return;
    let cancelled = false;
    getMyCards(token)
      .then((cards) => {
        if (cancelled || !cards?.length) return;
        const c = cards[0];
        setGenCard({ num: c.num, cvv: c.cvv, exp: c.exp, holder: c.holder });
        setApplied(true);
        if (c.theme) setCardTheme(c.theme);
        if (c.type) setCardType(c.type);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  // Restore a previously connected wallet's balance on reload so the Home & Card
  // balance displays aren't blank after a refresh.
  useEffect(() => {
    if (!user) return;
    try {
      const w = JSON.parse(localStorage.getItem('cc_wallet') || 'null');
      if (w?.id) applyWalletDisplay(w.id, w.name, w.balance);
    } catch {}
  }, [user, applyWalletDisplay]);

  // Mirror the backend wallet balance into the spendable-funds display. Runs on
  // login (auth response carries walletBalance), on getMe refresh, and on logout
  // (user → null → 0). This is the single source for the Home & Card balance tiles.
  useEffect(() => {
    setWalletFunds(Number(user?.walletBalance) || 0);
  }, [user]);

  // ── Persist & restore language / region so the Profile selection survives reload ──
  useEffect(() => {
    try {
      const l = localStorage.getItem('cc_lang');
      const d = localStorage.getItem('cc_dir');
      const c = localStorage.getItem('cc_country');
      if (l) setLangCode(l);
      if (d) setDir(d);
      if (c) setSelectedCountry(c);
    } catch {}
  }, []);

  // Skip the first run (default state) so we never clobber a saved value before the
  // restore effect above has applied it.
  const langHydrated = useRef(false);
  useEffect(() => {
    if (!langHydrated.current) { langHydrated.current = true; return; }
    try { localStorage.setItem('cc_lang', lang); localStorage.setItem('cc_dir', dir); } catch {}
  }, [lang, dir]);

  const countryHydrated = useRef(false);
  useEffect(() => {
    if (!countryHydrated.current) { countryHydrated.current = true; return; }
    try { localStorage.setItem('cc_country', selectedCountry); } catch {}
  }, [selectedCountry]);

  const copyVal = useCallback((val, msg) => {
    navigator.clipboard.writeText(val).catch(() => {});
    showToast(msg);
  }, [showToast]);

  const nextStep = useCallback((from) => {
    console.log(`nextStep called from step ${from}`);
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
    // if (from === 4) {
    //   if (!selectedChain) { showToast('Please select a network!'); return; }
    //   if (!termsChecked) { showToast('Please accept Terms & Conditions!'); return; }
    // }
    setStep(s => Math.min(s + 1, 5));
  }, [form, chosenPlan, selectedChain, termsChecked, showToast]);

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
    infoOpen, openInfo, closeInfo,
    user, authSheetOpen, setAuthSheetOpen, onAuthSuccess, logout,
    time, toast, showToast,
    applied, applying, genCard, walletBalance, chosenWallet,
    walletFunds, submitFundRequest, refreshUser,
    step, setStep, chosenPlan, setChosenPlan,
    cardType, setCardType, cardTheme, setCardTheme,
    connectedWalletId, pickWallet,
    selectedChain, setSelectedChain,
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
    nextStep, prevStep, issueCard, showCard, copyVal,
    activeTheme, setActiveTheme, cssVars, appConfig,
  };

  return (
    <CryptoCardContext.Provider value={value}>
      {children}
    </CryptoCardContext.Provider>
  );
}

export const useCryptoCard = () => useContext(CryptoCardContext);
