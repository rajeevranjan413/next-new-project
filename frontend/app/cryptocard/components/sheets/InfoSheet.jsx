'use client';

import {
  X, Gift, Award, Wallet, MousePointerClick, ArrowRightLeft,
  ShoppingCart, UtensilsCrossed, Plane, Crown, Check, ShieldCheck,
  Zap, Globe, Rocket,
} from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import s from '../../cryptocard.module.css';

/* Shared info popup opened from the Voucher / Reward balances (home hero cols
   + card-screen balance tiles). One component, two content sets, styled to
   match the premium voucher popup (.vou-*). Colour keys map to existing theme
   tokens so it re-themes automatically. */

const COLORS = {
  blue:  { c: 'var(--blue)',  bg: 'var(--bluebg)' },
  green: { c: 'var(--green)', bg: 'var(--gbg)' },
  gold:  { c: 'var(--bnb)',   bg: 'var(--bnbg)' },
  red:   { c: 'var(--red)',   bg: 'var(--rbg)' },
};

/* ── Voucher — “100 USDT claim process explained” ── */
const VOUCHER_STEPS = [
  {
    icon: Wallet, color: 'blue', tag: 'One-time',
    title: 'Top-up wallet (min. balance)',
    desc: 'Ensure your wallet holds a minimum balance of 500 USDT before clicking claim.',
  },
  {
    icon: MousePointerClick, color: 'green', tag: 'Instant',
    title: 'Claim the voucher',
    desc: "Click 'Claim' on the voucher. This action verifies Step 1 is complete.",
  },
  {
    icon: ArrowRightLeft, color: 'gold', tag: 'Withdraw anytime',
    title: 'Use & withdraw flexibility',
    desc: 'Use the 100 USDT for trades or purchases. Withdraw your 500 USDT balance anytime after claiming.',
  },
];
const VOUCHER_CONDS = [
  { icon: ShieldCheck, text: 'Min. balance 500 USDT — required only at the moment of claiming.' },
  { icon: Check,       text: 'Top-up mandatory — must hold 500 USDT to unlock the voucher.' },
  { icon: Zap,         text: 'One-time maintenance check only, never recurring.' },
  { icon: Gift,        text: 'Voucher is available to use immediately after claim.' },
];

/* ── Rewards — “Spend & earn 1%–10% cashback” ── */
const REWARD_TIERS = [
  { icon: ShoppingCart,    color: 'blue',  name: 'Everyday Spend',         sub: 'Shops & online',        pct: '2%' },
  { icon: UtensilsCrossed, color: 'green', name: 'Dining & Entertainment', sub: 'Restaurants & events',  pct: '5%' },
  { icon: Plane,           color: 'gold',  name: 'Travel & Experiences',   sub: 'Flights, hotels, stays', pct: '8%' },
  { icon: Crown,           color: 'red',   name: 'Premium Partner Offers', sub: 'Exclusive brands',      pct: '10%' },
];
const REWARD_CHIPS = [
  { icon: Globe,        text: 'Worldwide acceptance' },
  { icon: ShoppingCart, text: 'Shop & pay globally' },
];

export default function InfoSheet() {
  const { infoOpen, closeInfo } = useCryptoCard();
  if (!infoOpen) return null;

  const isVoucher = infoOpen === 'voucher';

  return (
    <div
      className={`${s['info-bg']} ${s.open}`}
      onClick={(e) => e.target === e.currentTarget && closeInfo()}
    >
      <div className={s['info-box']}>
        <button className={s['vou-x']} onClick={closeInfo} aria-label="Close">
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className={s['info-head']}>
          <div
            className={s['info-ribbon']}
            style={isVoucher
              ? { background: 'var(--gbg)', color: 'var(--green)' }
              : { background: 'var(--bluebg)', color: 'var(--blue)' }}
          >
            {isVoucher
              ? <><Gift size={11} strokeWidth={2.6} />100 USDT Voucher</>
              : <><Award size={11} strokeWidth={2.6} />Unlimited Rewards</>}
          </div>
          <div className={s['info-title']}>
            {isVoucher ? 'Claim Process Explained' : (
              <>Spend & Earn <em>1% – 10% Cashback</em></>
            )}
          </div>
          <div className={s['info-sub']}>
            {isVoucher
              ? 'Simple steps to unlock your bonus — and understand the flexibility.'
              : 'Tiered cashback based on your spending category, accepted worldwide.'}
          </div>
        </div>

        {isVoucher ? (
          <>
            {/* Steps */}
            <div className={s['info-steps']}>
              {VOUCHER_STEPS.map((st, i) => {
                const Icon = st.icon;
                const col = COLORS[st.color];
                return (
                  <div key={i} className={s['info-step']}>
                    <div className={s['info-step-ic']} style={{ background: col.bg, color: col.c }}>
                      <Icon size={17} strokeWidth={2} />
                      <span className={s['info-step-num']} style={{ background: col.c }}>{i + 1}</span>
                    </div>
                    <div className={s['info-step-body']}>
                      <div className={s['info-step-top']}>
                        <span className={s['info-step-title']}>{st.title}</span>
                        <span className={s['info-step-tag']} style={{ background: col.bg, color: col.c }}>{st.tag}</span>
                      </div>
                      <div className={s['info-step-desc']}>{st.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key conditions */}
            <div className={s['info-sec-h']}>Key Conditions</div>
            <div className={s['info-conds']}>
              {VOUCHER_CONDS.map((cond, i) => {
                const Icon = cond.icon;
                return (
                  <div key={i} className={s['info-cond']}>
                    <Icon size={14} strokeWidth={2.2} className={s['info-cond-ic']} />
                    <span>{cond.text}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Reward tiers */}
            <div className={s['info-tiers']}>
              {REWARD_TIERS.map((tier, i) => {
                const Icon = tier.icon;
                const col = COLORS[tier.color];
                return (
                  <div key={i} className={s['info-tier']}>
                    <div className={s['info-tier-ic']} style={{ background: col.bg, color: col.c }}>
                      <Icon size={17} strokeWidth={2} />
                    </div>
                    <div className={s['info-tier-body']}>
                      <div className={s['info-tier-name']}>{tier.name}</div>
                      <div className={s['info-tier-sub']}>{tier.sub}</div>
                    </div>
                    <div className={s['info-tier-pct']} style={{ color: col.c }}>{tier.pct}</div>
                  </div>
                );
              })}
            </div>

            {/* Global chips */}
            <div className={s['info-chips']}>
              {REWARD_CHIPS.map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <span key={i} className={s['info-chip']}>
                    <Icon size={12} strokeWidth={2.2} />{chip.text}
                  </span>
                );
              })}
            </div>
          </>
        )}

        <div className={s['info-foot']}>
          {isVoucher
            ? 'Terms & Conditions apply. Offer valid for new & existing users.'
            : 'Tiered reward structure based on spending category & terms.'}
        </div>

        <button className={s['info-cta']} onClick={closeInfo}>
          <Rocket size={15} strokeWidth={2.2} />
          Got it
        </button>
      </div>
    </div>
  );
}
