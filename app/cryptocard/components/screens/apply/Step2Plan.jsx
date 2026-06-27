'use client';

import { Check, Gift, ShieldCheck } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { PLANS } from '../../../config/plans';
import { PlanBadge } from '../../icons/PlanBadge';
import s from '../../../cryptocard.module.css';

export default function Step2Plan({ t }) {
  const { chosenPlan, setChosenPlan, nextStep, prevStep } = useCryptoCard();

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['step-title']}>{t.step2Title}</div>
      <div className={s['step-sub']}>{t.step2Sub}</div>

      <div className={s['plan-opts']}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`${s['plan-opt']} ${chosenPlan === plan.id ? s.sel : ''}`}
            onClick={() => setChosenPlan(plan.id)}
          >
            {plan.popular && <div className={s['po-pop']}>Popular</div>}
            <div className={s['po-ic']}><PlanBadge plan={plan.id} size={34} /></div>
            <div className={s['po-info']}>
              <div className={s['po-nm']} style={plan.nameColor ? { color: plan.nameColor } : {}}>{plan.name}</div>
              <div className={s['po-pr']}>{plan.desc}</div>
            </div>
            <div
              className={`${s['po-chk']} ${chosenPlan === plan.id ? s.sel : ''}`}
              style={chosenPlan === plan.id ? { background: 'var(--bnb)', borderColor: 'var(--bnb)', color: '#000' } : {}}
            >
              {chosenPlan === plan.id && <Check size={13} strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>

      <div className={`${s['step-note']} ${s['step-note-gold']}`}>
        <Gift size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>All plans include <strong style={{ color: 'var(--bnb)' }}>100 USDT welcome voucher</strong> + <strong style={{ color: 'var(--bnb)' }}>10% cashback</strong> on every swipe — auto-credited in USDT.</span>
      </div>
      <div className={`${s['step-note']} ${s['step-note-green']}`}>
        <ShieldCheck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />
        <span>Works on <strong>Amazon, Flipkart, Zomato, Petrol Pumps</strong> & all Visa-enabled POS terminals.</span>
      </div>

      <div className={s['step-nav']}>
        <button className={s['btn-back']} onClick={prevStep}>{t.btnBack}</button>
        <button className={s['btn-next']} onClick={() => nextStep(2)}>Choose Card Design →</button>
      </div>
    </div>
  );
}
