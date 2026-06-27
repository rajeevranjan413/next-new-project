'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, Globe, Map, Search } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../config/i18n';
import { LANGUAGES, COUNTRIES } from '../../config/languages';
import s from '../../cryptocard.module.css';

function NavDropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className={s.navDropWrap} ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger(open)}</div>
      {open && (
        <div className={`${s.navDropMenu} ${align === 'right' ? s.alignRight : s.alignLeft}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function LangSelector() {
  const { lang, setLangCode, setDir } = useCryptoCard();
  const t        = LANGS[lang] || LANGS.EN;
  const [search, setSearch] = useState('');
  const flatLangs = LANGUAGES.filter(l => !l.group);
  const current   = flatLangs.find(l => l.code === lang) || flatLangs[0];
  const q         = search.toLowerCase();
  const filtered  = LANGUAGES.filter(item =>
    item.group ||
    item.label.toLowerCase().includes(q) ||
    (item.code && item.code.toLowerCase().includes(q))
  );

  return (
    <NavDropdown trigger={(open) => (
      <button className={s.langBtn}>
        <span className={s.langFlag}>{current.flag}</span>
        <span className={s.langCode}>{current.code}</span>
        <ChevronDown size={12} strokeWidth={2} className={`${s.langChevron} ${open ? s.open : ''}`} />
      </button>
    )}>
      {(close) => (
        <>
          <div className={s.dropHead}><Globe size={13} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.langHdr || 'Language'}</div>
          <div className={s.dropSearch}>
            <Search size={12} strokeWidth={2} className={s.dropSearchIc} />
            <input className={s.dropSearchInput} type="text" placeholder={t.searchLang || 'Search language…'} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          <div className={s.dropList}>
            {filtered.map((item, i) =>
              item.group ? (
                search ? null : <div key={i} className={s.dropGroup}>{item.group}</div>
              ) : (
                <button key={item.code} className={`${s.dropItem} ${lang === item.code ? s.active : ''}`}
                  onClick={() => { setLangCode(item.code); setDir(item.dir || 'ltr'); setSearch(''); close(); }}>
                  <span>{item.flag}</span>
                  <span className={s.dropItemLabel}>{item.label}</span>
                  {lang === item.code && <Check size={12} strokeWidth={3} style={{ marginLeft: 'auto', color: '#0ECB81', flexShrink: 0 }} />}
                </button>
              )
            )}
          </div>
        </>
      )}
    </NavDropdown>
  );
}

function CountrySelector() {
  const { selectedCountry, setSelectedCountry, lang, showToast } = useCryptoCard();
  const t       = LANGS[lang] || LANGS.EN;
  const [search, setSearch] = useState('');
  const current = COUNTRIES.find(c => c.name === selectedCountry) || COUNTRIES.find(c => c.name);
  const q       = search.toLowerCase();
  const filtered = COUNTRIES.filter(item =>
    item.group ||
    (item.name && item.name.toLowerCase().includes(q)) ||
    (item.cur  && item.cur.toLowerCase().includes(q))
  );

  return (
    <NavDropdown trigger={(open) => (
      <button className={s.countryBtn}>
        <span className={s.langFlag}>{current?.flag || '🌍'}</span>
        <span className={s.langCode}>{current?.cur || 'USD'}</span>
        <ChevronDown size={12} strokeWidth={2} className={`${s.langChevron} ${open ? s.open : ''}`} />
      </button>
    )}>
      {(close) => (
        <>
          <div className={s.dropHead}><Map size={13} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.countryHdr || 'Country'}</div>
          <div className={s.dropSearch}>
            <Search size={12} strokeWidth={2} className={s.dropSearchIc} />
            <input className={s.dropSearchInput} type="text" placeholder={t.searchCountry || 'Search country…'} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          <div className={s.dropList}>
            {filtered.map((c, i) =>
              c.group ? (
                search ? null : <div key={i} className={s.dropGroup}>{c.group}</div>
              ) : (
                <button key={c.name} className={`${s.dropItem} ${selectedCountry === c.name ? s.active : ''}`}
                  onClick={() => { setSelectedCountry(c.name); showToast(`${c.flag} ${c.name} · ${c.cur}`); setSearch(''); close(); }}>
                  <span>{c.flag}</span>
                  <span className={s.dropItemLabel}>{c.name}</span>
                  <span className={s.dropItemSub}>{c.cur}</span>
                  {selectedCountry === c.name && <Check size={12} strokeWidth={3} style={{ marginLeft: 'auto', color: '#0ECB81', flexShrink: 0 }} />}
                </button>
              )
            )}
          </div>
        </>
      )}
    </NavDropdown>
  );
}

export default function WebNav() {
  const { goScreen, lang } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  return (
    <nav className={s.webNav}>
      <button className={s.navLogo} onClick={() => goScreen('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true">
          <polygon points="10,1 19,6.5 19,13.5 10,19 1,13.5 1,6.5" fill="#F0B90B" />
          <polygon points="10,5.5 15.5,8.8 15.5,11.2 10,14.5 4.5,11.2 4.5,8.8" fill="#070712" />
        </svg>
        CryptoCard Pro
      </button>
      <div className={s.navLinks}>
        <button className={s.navLink} onClick={() => goScreen('safety')}>{t.navSecurity || 'Security'}</button>
        <button className={s.navLink} onClick={() => goScreen('card')}>{t.navCards || 'Cards'}</button>
        <button className={s.navLink} onClick={() => goScreen('apply')}>{t.navPlans || 'Plans'}</button>
        <button className={s.navLink} onClick={() => goScreen('profile')}>{t.navProfile}</button>
      </div>
      <div className={s.navRight}>
        <CountrySelector />
        <LangSelector />
        <button className={s.navCta} onClick={() => goScreen('apply')}>
          {t.bigCta || 'Get FREE Card'}
          <ChevronRight size={14} strokeWidth={2.5} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </button>
      </div>
    </nav>
  );
}
