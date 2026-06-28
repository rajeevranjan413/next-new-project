'use client';

import { Lock, Check, ShieldCheck, Rocket } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../config/i18n';
import s from '../../cryptocard.module.css';

export default function HeroPanel() {
  const { goScreen, lang, dir } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;

  return (
    <div className={s.heroPanel} dir={dir}>
      <div className={s.heroBadge}>
        <svg width="12" height="12" viewBox="0 0 20 20" style={{ verticalAlign: 'middle', marginRight: 6, flexShrink: 0 }}>
          <polygon points="10,1 19,6.5 19,13.5 10,19 1,13.5 1,6.5" fill="#F0B90B" />
        </svg>
        {t.heroBadge || 'FREE Virtual Card · 100 USDT Welcome Bonus'}
      </div>

      <h1 className={s.heroTitle}>
        {t.heroTitle || 'Pay with Crypto,'}{' '}
        <span className={s.heroAccent}>{t.heroAccent || 'Anywhere'}</span>{' '}
        {t.heroTitle2 || 'in the World'}
      </h1>

      <p className={s.heroDesc}>
        {t.heroDesc || 'Connect your Trust Wallet or MetaMask. Get a free virtual Visa card instantly. Spend crypto at any store worldwide.'}
      </p>

      <div className={s.heroCtas}>
        <button className={s.ctaPrimary} onClick={() => goScreen('apply')}>
          <Rocket size={15} strokeWidth={2} style={{ marginRight: 7, verticalAlign: 'middle' }} />
          {t.bigCta || 'Get FREE Card'}
        </button>
        <button className={s.ctaSecondary} onClick={() => goScreen('safety')}>
          {t.heroCta2 || 'How It Works'}
        </button>
      </div>

      <div className={s.heroStats}>
        <div className={s.heroStat}><span className={s.statNum}>284K+</span><span className={s.statLbl}>{t.statCards || 'Cards Issued'}</span></div>
        <div className={s.statDivider} />
        <div className={s.heroStat}><span className={s.statNum}>190+</span><span className={s.statLbl}>{t.statCountries || 'Countries'}</span></div>
        <div className={s.statDivider} />
        <div className={s.heroStat}><span className={s.statNum}>$94K</span><span className={s.statLbl}>{t.statUSDT || 'USDT Paid'}</span></div>
      </div>

      <div className={s.trustRow}>
        <span className={s.trustItem}><Lock size={11} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.trustNonCustodial || 'Non-Custodial'}</span>
        <span className={s.trustItem}><Check size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.trustKyc || 'KYC Verified'}</span>
        <span className={s.trustItem}><ShieldCheck size={11} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.trustPci || 'PCI-DSS'}</span>
      </div>
    </div>
  );
}
