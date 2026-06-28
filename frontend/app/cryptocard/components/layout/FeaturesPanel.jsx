'use client';

import { Globe, Zap, Gift, Wallet, Lock, Bot } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../config/i18n';
import { BENEFITS } from '../../config/content';
import { PLANS } from '../../config/plans';
import { PlanBadge } from '../icons/PlanBadge';
import s from '../../cryptocard.module.css';

const LUCIDE_MAP = { Globe, Zap, Gift, Wallet, Lock, Bot };

export default function FeaturesPanel() {
  const { goScreen, lang, dir } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;

  return (
    <div className={s.featuresPanel} dir={dir}>
      <div className={s.fpTag}>{t.fpTag || 'Why CryptoCard Pro?'}</div>
      <div className={s.fpTitle}>{t.fpTitle || 'Everything you need to spend crypto like cash'}</div>

      <div className={s.featuresList}>
        {BENEFITS.map((b) => {
          const BIcon = LUCIDE_MAP[b.icon];
          return (
            <div key={b.title} className={s.featureItem}>
              <div className={s.featureIconWrap} style={{ background: b.bg, color: b.color }}>
                {BIcon && <BIcon size={18} strokeWidth={1.8} />}
              </div>
              <div>
                <div className={s.featureName}>{b.title}</div>
                <div className={s.featureDesc}>{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={s.planMiniRow}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`${s.planMiniCard} ${plan.popular ? s.planMiniFeatured : ''}`}
            onClick={() => goScreen('apply')}
          >
            <PlanBadge plan={plan.id} size={28} />
            <div className={s.planMiniName} style={plan.nameColor ? { color: plan.nameColor } : {}}>{plan.name}</div>
            <div className={s.planMiniPrice}>{plan.price === 'FREE' ? (t.planFreeLabel || 'FREE') : `${plan.price} USDT`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
