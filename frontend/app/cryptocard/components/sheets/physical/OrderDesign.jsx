'use client';

import { Package, Palette, Check } from 'lucide-react';
import s from '../../../cryptocard.module.css';

const OPTIONS = [
  { id: 'standard', Icon: Package, title: 'Standard Design', desc: 'Official CryptoCard Pro design' },
  { id: 'custom',   Icon: Palette, title: 'Custom Design',   desc: 'Our team contacts you for design' },
];

export default function OrderDesign({ physType, setPhysType, onNext }) {
  const noteText = physType === 'standard'
    ? 'Standard selected. 10 USDT fee. Same card number & CVV. Delivery 7–10 days.'
    : physType === 'custom'
    ? 'Custom selected. 10 USDT fee. Team will contact for design. Card number & CVV unchanged.'
    : '';

  return (
    <>
      <div className={s['phys-opts']}>
        {OPTIONS.map((opt) => {
          const sel = physType === opt.id;
          return (
            <div key={opt.id} className={`${s['ph-opt']} ${sel ? s.sel : ''}`} onClick={() => setPhysType(opt.id)}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: sel ? 'var(--bnbg)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel ? 'var(--bnb)' : 'var(--t3)', flexShrink: 0 }}>
                <opt.Icon size={18} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div className={`${s['pho-chk']} ${sel ? s.sel : ''}`} style={sel ? { background: 'var(--bnb)', borderColor: 'var(--bnb)', color: '#000' } : {}}>
                {sel && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {noteText && (
        <div className={s['phys-note']}>
          <Check size={12} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          {noteText}
        </div>
      )}

      <button className={s['btn-primary']} style={{ width: '100%', padding: 13, fontSize: 14 }} onClick={onNext}>
        Continue to Shipping
      </button>
    </>
  );
}
