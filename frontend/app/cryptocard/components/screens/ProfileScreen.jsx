'use client';

import { useState } from 'react';
import { ChevronRight, CreditCard, ShieldCheck, Headphones, FileText, BadgeCheck, Globe, Map, Search, Check, LogOut, Calendar, Phone, MapPin } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGUAGES, COUNTRIES, LANGS, WORLD_COUNTRIES } from '../../data';
import s from '../../cryptocard.module.css';

const MENU_ITEMS = [
  { Icon: CreditCard, color: 'var(--bnb)', bg: 'var(--bnbg)', nmKey: 'menuCard', dsKey: 'menuCardSub', screen: 'card' },
  { Icon: ShieldCheck, color: 'var(--green)', bg: 'var(--gbg)', nmKey: 'menuSafety', dsKey: 'menuSafetySub', screen: 'safety' },
  { Icon: Headphones, color: 'var(--blue)', bg: 'var(--bluebg)', nmKey: 'menuSupport', dsKey: 'menuSupportSub', sheet: 'support' },
  { Icon: FileText, color: '#a78bfa', bg: 'rgba(139,92,246,.12)', nmKey: 'menuTerms', dsKey: 'menuTermsSub', sheet: 'terms' },
];

export default function ProfileScreen({ active }) {
  const { profName, profEmail, profInitial, profileDetails, lang, setLangCode, setDir, dir, selectedCountry, setSelectedCountry, showToast, goScreen, openSheet, screenFlash, user, logout } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;

  const flashing = screenFlash === 'profile';
  const [lcTab, setLcTab] = useState('lang');
  const [search, setSearch] = useState('');

  const currentCountry = COUNTRIES.find(c => c.name === selectedCountry);
  const currentLang = LANGUAGES.find(l => l.code === lang);

  // Personal details captured from the apply-form Step 1 (see nextStep in context).
  const pd = profileDetails;
  const pdCountry = pd && WORLD_COUNTRIES.find(c => c.name === pd.country);
  const fmtDob = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };
  // Only the details not already shown in the hero (which has name + email).
  const detailRows = pd ? [
    { Icon: Calendar, label: t.pdDob     || 'Date of Birth', value: fmtDob(pd.dob) },
    { Icon: Phone,    label: t.pdPhone   || 'Phone',         value: pd.phone ? `${pd.countryCode || ''} ${pd.phone}`.trim() : '' },
    { Icon: MapPin,   label: t.pdCountry || 'Country',       value: pd.country ? `${pdCountry ? pdCountry.flag + ' ' : ''}${pd.country}` : '' },
  ].filter(r => r.value) : [];

  const handleLang = (item) => {
    setLangCode(item.code);
    setDir(item.dir || 'ltr');
    showToast(`${item.label.split(' · ')[0]} selected!`);
    setSearch('');
  };

  const handleCountry = (c) => {
    setSelectedCountry(c.name);
    showToast(`${c.flag} ${c.name} · ${c.cur}`);
    setSearch('');
  };

  const q = search.toLowerCase();
  const filteredLangs = LANGUAGES.filter(item =>
    item.group ||
    item.label.toLowerCase().includes(q) ||
    (item.code && item.code.toLowerCase().includes(q))
  );
  const filteredCountries = COUNTRIES.filter(item =>
    item.group ||
    (item.name && item.name.toLowerCase().includes(q)) ||
    (item.cur && item.cur.toLowerCase().includes(q))
  );

  const switchTab = (tab) => { setLcTab(tab); setSearch(''); };

  const handleLogout = () => {
    logout();
    showToast(t.loggedOut || 'Logged out');
    goScreen('home');
  };

  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`} dir={dir}>
      <div className={s['profile-screen']}>


        {/* Profile Hero */}
        <div className={s['profile-hero']}>
          <div className={s['ph-av']}>{profInitial}</div>
          <div className={s['ph-name']}>{profName}</div>
          <div className={s['ph-email']}>{profEmail}</div>
          <div className={s['ph-meta-row']}>
            <div className={s['ph-badge']}>
              <BadgeCheck size={12} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {t.verifiedMember || 'Verified Member'}
            </div>
            {currentCountry && (
              <div className={s['ph-country-chip']}>
                {currentCountry.flag} {currentCountry.cur}
              </div>
            )}
            {currentLang && (
              <div className={s['ph-lang-chip']}>
                {currentLang.flag} {lang}
              </div>
            )}
          </div>
        </div>

        {/* Region Settings */}
        <div className={s['region-section-hdr']}>
          <Globe size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {t.langRegion || 'Language & Region'}
        </div>

        {/* Tabs */}
        <div className={s['lc-tabs']}>
          <button
            className={`${s['lct-btn']} ${lcTab === 'lang' ? s.active : ''}`}
            onClick={() => switchTab('lang')}
          >
            <Globe size={12} strokeWidth={2} />
            {t.langHdr || 'Language'}
            {lang !== 'EN' && <span className={s['lct-dot']} />}
          </button>
          <button
            className={`${s['lct-btn']} ${lcTab === 'country' ? s.active : ''}`}
            onClick={() => switchTab('country')}
          >
            <Map size={12} strokeWidth={2} />
            {t.countryHdr || 'Country'}
          </button>
        </div>

        {/* Search */}
        <div className={s['lcs-wrap']}>
          <Search size={13} strokeWidth={2} className={s['lcs-ic']} />
          <input
            className={s['lcs-input']}
            type="text"
            placeholder={lcTab === 'lang' ? (t.searchLang || 'Search language…') : (t.searchCountry || 'Search country…')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Selector List */}
        <div className={s['lc-list-full']}>
          {lcTab === 'lang' ? (
            filteredLangs.filter(i => !i.group).length === 0 ? (
              <div className={s['lc-empty']}>{t.noResults || 'No results found'}</div>
            ) : filteredLangs.map((item, i) =>
              item.group ? (
                search ? null : <div key={i} className={s['lc-group']}>{item.group}</div>
              ) : (
                <div
                  key={item.code}
                  className={`${s['lc-item']} ${lang === item.code ? s.sel : ''}`}
                  onClick={() => handleLang(item)}
                >
                  <span className={s['lc-flag']}>{item.flag}</span>
                  <span className={s['lc-label']}>{item.label}</span>
                  {lang === item.code && <Check size={13} strokeWidth={3} style={{ color: 'var(--bnb)', flexShrink: 0 }} />}
                </div>
              )
            )
          ) : (
            filteredCountries.filter(c => !c.group).length === 0 ? (
              <div className={s['lc-empty']}>{t.noResults || 'No results found'}</div>
            ) : filteredCountries.map((c, i) =>
              c.group ? (
                search ? null : <div key={i} className={s['lc-group']}>{c.group}</div>
              ) : (
                <div
                  key={c.name}
                  className={`${s['lc-item']} ${selectedCountry === c.name ? s.sel : ''}`}
                  onClick={() => handleCountry(c)}
                >
                  <span className={s['lc-flag']}>{c.flag}</span>
                  <span className={s['lc-label']}>{c.name}</span>
                  <span className={s['lc-cur']}>{c.cur}</span>
                  {selectedCountry === c.name && <Check size={13} strokeWidth={3} style={{ color: 'var(--bnb)', flexShrink: 0 }} />}
                </div>
              )
            )
          )}
        </div>

        {/* Menu */}
        <div className={s['menu-list']}>
          {MENU_ITEMS.map((item, i) => (
            <div key={i} className={s.mi} onClick={() => item.screen ? goScreen(item.screen) : openSheet(item.sheet)}>
              <div className={s['mi-ic']} style={{ background: item.bg, color: item.color }}>
                <item.Icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div className={s['mi-nm']}>{t[item.nmKey]}</div>
                <div className={s['mi-ds']}>{t[item.dsKey]}</div>
              </div>
              <div className={s['mi-arrow']}><ChevronRight size={16} strokeWidth={2} /></div>
            </div>
          ))}

          {user && (
            <div className={s.mi} onClick={handleLogout}>
              <div className={s['mi-ic']} style={{ background: 'rgba(246,70,93,.12)', color: '#F6465D' }}>
                <LogOut size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div className={s['mi-nm']} style={{ color: '#F6465D' }}>{t.menuLogout || 'Log out'}</div>
                <div className={s['mi-ds']}>{t.menuLogoutSub || 'Sign out of your account'}</div>
              </div>
              <div className={s['mi-arrow']}><ChevronRight size={16} strokeWidth={2} /></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
