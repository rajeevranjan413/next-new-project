'use client';

import { Bitcoin, Truck, Check, Package } from 'lucide-react';
import { ORDER_AMOUNT_USDT, COD_POLICY } from '../../../config/physicalCard';
import { useCryptoCard } from '../../../CryptoCardContext';
import CryptoPayPanel from './CryptoPayPanel';
import s from '../../../cryptocard.module.css';

const METHODS = [
  { id: 'crypto', Icon: Bitcoin, title: 'Pay with Crypto', desc: 'USDT · Tron or BNB Smart Chain' },
  { id: 'cod',    Icon: Truck,   title: 'Cash on Delivery', desc: 'Pay in cash when your card arrives' },
];

export default function OrderPayment({ payMethod, setPayMethod, placing, onPlaceOrder }) {
  const { physType } = useCryptoCard();
  const designLabel = physType === 'custom' ? 'Custom Design' : 'Standard Design';

  return (
    <>
      {/* Order summary */}
      <div className={s['ord-summary']}>
        <div className={s['ord-sum-row']}>
          <span className={s['ord-sum-lbl']}><Package size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />Physical Card · {designLabel}</span>
          <span className={s['ord-sum-val']}>{ORDER_AMOUNT_USDT} USDT</span>
        </div>
        <div className={s['ord-sum-row']}>
          <span className={s['ord-sum-lbl']}>Shipping</span>
          <span className={s['ord-sum-free']}>FREE</span>
        </div>
        <div className={s['ord-sum-divider']} />
        <div className={s['ord-sum-row']}>
          <span className={s['ord-sum-total-lbl']}>Total</span>
          <span className={s['ord-sum-total']}>{ORDER_AMOUNT_USDT} USDT</span>
        </div>
      </div>

      {/* Payment method selector */}
      <div className={s['w-section-lbl']}>Payment Method</div>
      <div className={s['phys-opts']}>
        {METHODS.map((m) => {
          const sel = payMethod === m.id;
          return (
            <div key={m.id} className={`${s['ph-opt']} ${sel ? s.sel : ''}`} onClick={() => setPayMethod(m.id)}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: sel ? 'var(--bnbg)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel ? 'var(--bnb)' : 'var(--t3)', flexShrink: 0 }}>
                <m.Icon size={18} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{m.desc}</div>
              </div>
              <div className={`${s['pho-chk']} ${sel ? s.sel : ''}`} style={sel ? { background: 'var(--bnb)', borderColor: 'var(--bnb)', color: '#000' } : {}}>
                {sel && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Crypto flow: network + address + QR + countdown */}
      {payMethod === 'crypto' && (
        <CryptoPayPanel placing={placing} onConfirm={(extra) => onPlaceOrder('crypto', extra)} />
      )}

      {/* COD flow: policy note + place order */}
      {payMethod === 'cod' && (
        <>
          <div className={`${s['step-note']} ${s['step-note-green']}`} style={{ marginTop: 12 }}>
            <Truck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />
            <span>{COD_POLICY}</span>
          </div>
          <button
            className={s['btn-primary']}
            style={{ width: '100%', padding: 13, fontSize: 14 }}
            disabled={placing}
            onClick={() => onPlaceOrder('cod')}
          >
            {placing ? 'Placing order…' : 'Place Order — Cash on Delivery'}
          </button>
        </>
      )}
    </>
  );
}
