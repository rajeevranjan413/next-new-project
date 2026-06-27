'use client';

import { CheckCircle } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { CARD_THEMES } from '../../../config/theme';
import { VirtualCard, PhysicalCard } from '../../cards';
import s from '../../../cryptocard.module.css';

export default function Step5Done({ t }) {
  const { form, showCard, cardTheme, cardType } = useCryptoCard();
  const theme  = CARD_THEMES.find(th => th.id === cardTheme) || CARD_THEMES[0];
  const holder = `${form.firstName} ${form.lastName}`.trim().toUpperCase() || 'CARD HOLDER';

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
        <button className={s['sc-btn']} onClick={showCard}>{t.viewCard}</button>
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#EAECEF' }}>{holder}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 3 }}>Card Number</div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, color: '#EAECEF', fontVariantNumeric: 'tabular-nums' }}>•••• •••• •••• ••••</div>
        </div>
      </div>

      <div className={`${s['step-note']} ${s['step-note-green']}`} style={{ marginTop: 12, color: 'var(--green)' }}>
        <CheckCircle size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Voucher of <strong>100 USDT is PENDING</strong> — make any 100 USDT+ transaction to auto-claim.</span>
      </div>
    </div>
  );
}
