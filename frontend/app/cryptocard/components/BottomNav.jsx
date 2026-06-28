'use client';

import { Home, CreditCard, Plus, ShieldCheck, User } from 'lucide-react';
import { useCryptoCard } from '../CryptoCardContext';
import { LANGS } from '../data';
import s from '../cryptocard.module.css';

export default function BottomNav() {
  const { screen, goScreen, lang } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;

  return (
    <div className={s.bnav}>
      <button className={`${s.bn} ${screen === 'home' ? s.on : ''}`} onClick={() => goScreen('home')}>
        <div className={s.bi}><Home size={20} strokeWidth={screen === 'home' ? 2.5 : 1.8} /></div>
        <div className={s.bl}>{t.navHome}</div>
      </button>
      <button className={`${s.bn} ${screen === 'card' ? s.on : ''}`} onClick={() => goScreen('card')}>
        <div className={s.bi}><CreditCard size={20} strokeWidth={screen === 'card' ? 2.5 : 1.8} /></div>
        <div className={s.bl}>{t.navCard}</div>
      </button>
      <div className={s['bn-center-wrap']}>
        <button className={s['bn-center']} onClick={() => goScreen('apply')}>
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>
      <button className={`${s.bn} ${screen === 'safety' ? s.on : ''}`} onClick={() => goScreen('safety')}>
        <div className={s.bi}><ShieldCheck size={20} strokeWidth={screen === 'safety' ? 2.5 : 1.8} /></div>
        <div className={s.bl}>{t.navSafety}</div>
      </button>
      <button className={`${s.bn} ${screen === 'profile' ? s.on : ''}`} onClick={() => goScreen('profile')}>
        <div className={s.bi}><User size={20} strokeWidth={screen === 'profile' ? 2.5 : 1.8} /></div>
        <div className={s.bl}>{t.navProfile}</div>
      </button>
    </div>
  );
}
