'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { CARD_THEMES } from '../../../config/theme';
import { VirtualCard, PhysicalCard } from '../../cards';
import s from '../../../cryptocard.module.css';

export default function Step5Done({ t }) {
  const { form, genCard, issueCard, showCard, applying, cardTheme, cardType } = useCryptoCard();
  const theme  = CARD_THEMES.find(th => th.id === cardTheme) || CARD_THEMES[0];

  // Mint the card as soon as the applicant reaches the success step, so we can show its
  // real number & holder here (issueCard leaves `applied` false, so the wizard stays put).
  const issuedRef = useRef(false);
  useEffect(() => {
    if (issuedRef.current) return;
    issuedRef.current = true;
    issueCard();
  }, [issueCard]);

  const [revealed, setRevealed] = useState(false);

  const holder = (genCard?.holder
    || `${form.firstName} ${form.lastName}`.trim().toUpperCase()
    || 'CARD HOLDER');

  // Mask all but the last group until the user reveals it (their own card, but treat
  // the PAN like sensitive data by default).
  const groups     = genCard?.num ? genCard.num.split(' ') : [];
  const maskedNum  = groups.length
    ? groups.map((g, i) => (i === groups.length - 1 ? g : '••••')).join(' ')
    : '•••• •••• •••• ••••';
  const cardNumber = revealed && genCard?.num ? genCard.num : maskedNum;

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['success-card']}>
        <div className={s['sc-ic']}>
          <CheckCircle size={52} strokeWidth={1.3} style={{ color: 'var(--green)' }} />
        </div>
        <div className={s['sc-title']}>{t.cardApplied}</div>
        <div className={s['sc-sub']}>
          Your FREE virtual CryptoCard Pro is instantly active! Physical card optional (10 USDT flat).<br /><br />
          Make a <strong style={{ color: 'var(--bnb)' }}>100 USDT+ transaction</strong> to auto-unlock your 100 USDT welcome voucher + earn{' '}
          <strong style={{ color: 'var(--bnb)' }}>10% cashback</strong> on every swipe.
        </div>
        <button className={s['sc-btn']} onClick={showCard} disabled={applying}>
          {applying ? 'Issuing your card…' : t.viewCard}
        </button>
      </div>

      <div className={s['cd-stage']} style={{ marginTop: 12 }}>
        {cardType === 'physical'
          ? <PhysicalCard />
          : <VirtualCard theme={theme} />}
      </div>

      {/* Card holder info — visible only at this last step */}
      <div style={{
        background: 'var(--s1)',
        border: '1px solid var(--bd)',
        borderRadius: 12,
        padding: '10px 14px',
        marginTop: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 3 }}>Card Holder</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{holder}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 3 }}>Card Number</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{cardNumber}</span>
            <button
              type="button"
              onClick={() => setRevealed(r => !r)}
              disabled={!genCard?.num}
              aria-label={revealed ? 'Hide card number' : 'Reveal card number'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', padding: 0,
                cursor: genCard?.num ? 'pointer' : 'default',
                color: 'var(--t2)', opacity: genCard?.num ? 1 : 0.4,
              }}
            >
              {revealed ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`${s['step-note']} ${s['step-note-green']}`} style={{ marginTop: 12, color: 'var(--green)' }}>
        <CheckCircle size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Voucher of <strong>100 USDT is PENDING</strong> — make any 100 USDT+ transaction to auto-claim.</span>
      </div>
    </div>
  );
}
