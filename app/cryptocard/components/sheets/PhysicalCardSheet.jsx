'use client';

import { Package, Palette, Check } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import s from '../../cryptocard.module.css';

const OPTIONS = [
  { id: 'standard', Icon: Package, title: 'Standard Design', desc: 'Official CryptoCard Pro design' },
  { id: 'custom', Icon: Palette, title: 'Custom Design', desc: 'Our team contacts you for design' },
];

export default function PhysicalCardSheet() {
  const { sheet, closeSheet, physType, setPhysType, showToast } = useCryptoCard();

  const confirm = () => {
    closeSheet();
    showToast('Physical card order submitted!');
  };

  const noteText = physType === 'standard'
    ? 'Standard selected. 10 USDT fee. Same card number & CVV. Delivery 7–10 days.'
    : physType === 'custom'
    ? 'Custom selected. 10 USDT fee. Team will contact for design. Card number & CVV unchanged.'
    : '';

  return (
    <div className={`${s['sheet-bg']} ${sheet === 'physical' ? s.open : ''}`} onClick={e => e.target === e.currentTarget && closeSheet()}>
      <div className={s.sheet}>
        <div className={s['sh-handle']} />
        <div className={s['sh-title']}>
          <Package size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Order Physical Card
        </div>
        <div className={s['sh-sub']}>One-time 10 USDT fee · 7–10 business days delivery · Same card number &amp; CVV as your virtual card.</div>
        <div className={s['phys-opts']}>
          {OPTIONS.map(opt => (
            <div key={opt.id} className={`${s['ph-opt']} ${physType === opt.id ? s.sel : ''}`} onClick={() => setPhysType(opt.id)}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: physType === opt.id ? 'var(--bnbg)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: physType === opt.id ? 'var(--bnb)' : 'var(--t3)', flexShrink: 0 }}>
                <opt.Icon size={18} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div className={`${s['pho-chk']} ${physType === opt.id ? s.sel : ''}`} style={physType === opt.id ? { background: 'var(--bnb)', borderColor: 'var(--bnb)', color: '#000' } : {}}>
                {physType === opt.id && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>
        {noteText && <div className={s['phys-note']}><Check size={12} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 5 }} />{noteText}</div>}
        <button className={s['btn-primary']} style={{ width: '100%', padding: 13, fontSize: 14 }} onClick={confirm}>
          Confirm Order — 10 USDT
        </button>
      </div>
    </div>
  );
}
