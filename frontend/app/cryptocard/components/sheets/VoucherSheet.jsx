'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Rocket, Clock, Gift, Zap } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../data';
import s from '../../cryptocard.module.css';

/* Welcome-bonus popup ported from the HTML template. Auto-pops on every new
   session, with a live countdown + shrinking slot counter, then routes to Apply.
   All copy/numbers are admin-editable via appConfig.voucher — an empty admin
   field falls back to the localized (i18n) string, then a hardcoded default. */
export default function VoucherSheet() {
  const { goScreen, lang, appConfig, voucherOpen, openVoucher, closeVoucher } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  const v = appConfig?.voucher || {};
  const enabled = v.enabled !== false;

  // pick: admin override → i18n → hardcoded default
  const pick = (adminVal, i18nVal, fallback) => adminVal || i18nVal || fallback;

  const offerMinutes = Number.isFinite(v.offerMinutes) ? v.offerMinutes : 15;
  const [secs, setSecs] = useState(() => Math.max(1, offerMinutes) * 60 - 1);
  const [slots, setSlots] = useState(() => (Number.isFinite(v.slots) ? v.slots : 47));
  const autoShown = useRef(false);

  // Auto-pop shortly after load — on every new session (each fresh app load).
  // The ref just stops it re-firing on internal re-renders within the same load.
  useEffect(() => {
    if (!enabled || autoShown.current) return;
    autoShown.current = true;
    const id = setTimeout(() => openVoucher(), 1200);
    return () => clearTimeout(id);
  }, [enabled, openVoucher]);

  // Countdown + slot drain only run while the popup is on screen.
  useEffect(() => {
    if (!voucherOpen) return;
    const t1 = setInterval(() => setSecs(x => (x <= 0 ? 0 : x - 1)), 1000);
    const t2 = setInterval(() => setSlots(x => (x > 14 && Math.random() < 0.12 ? x - 1 : x)), 4500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [voucherOpen]);

  if (!enabled || !voucherOpen) return null;

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  const apply = () => { closeVoucher(); setTimeout(() => goScreen('apply'), 120); };

  return (
    <div className={`${s['vou-bg']} ${s.open}`} onClick={e => e.target === e.currentTarget && closeVoucher()}>
      <div className={s['vou-box']}>
        <button className={s['vou-x']} onClick={closeVoucher} aria-label="Close">
          <X size={14} strokeWidth={2.5} />
        </button>

        <div className={s['vou-ribbon']}>
          <Zap size={11} strokeWidth={2.6} />{pick(v.limitedText, t.popLimited, 'LIMITED — Today Only')}
        </div>

        <div className={s['vou-title']}>
          {pick(v.title, t.popTitle, 'Apply Today & Get')}
          <br />
          <em>{pick(v.highlight, t.popFree, '100 USDT FREE')} <Gift size={17} strokeWidth={2} style={{ verticalAlign: '-3px' }} /></em>
        </div>
        <div className={s['vou-sub']}>{pick(v.subtitle, t.popSub, 'Welcome bonus for new applicants — today only!')}</div>

        <div className={s['vou-bonus']}>
          <div className={s['vou-amt']}>{pick(v.amount, null, '100 USDT')}</div>
          <div className={s['vou-amt-lbl']}>{pick(v.bonusNote, t.popBonusNote, 'Min. 100 USDT transaction → auto-claimed to wallet')}</div>
        </div>

        <div className={s['vou-timer']}>
          <Clock size={12} strokeWidth={2} />
          {t.popOfferEnds || 'Offer ends in'}
          <span className={s['vou-clock']}>{mm}:{ss}</span>
        </div>

        <button className={s['vou-cta']} onClick={apply}>
          <Rocket size={15} strokeWidth={2.2} />
          {pick(v.ctaText, t.popCta, 'Apply Now — Claim 100 USDT')}
        </button>

        <div className={s['vou-slots']}>
          <Zap size={11} strokeWidth={2.6} />
          {t.popSlotsA || 'Only'} {slots} {t.popSlotsB || 'slots left today!'}
        </div>

        <button className={s['vou-skip']} onClick={closeVoucher}>
          {pick(v.skipText, t.popSkip, "No thanks, I'll miss this")}
        </button>
      </div>
    </div>
  );
}
