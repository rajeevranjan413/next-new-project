'use client';

import { CheckCircle2, Truck, Clock } from 'lucide-react';
import s from '../../../cryptocard.module.css';

export default function OrderDone({ order, payMethod, onClose, onTrack }) {
  const isCod = payMethod === 'cod';
  return (
    <div className={s['ord-done']}>
      <div className={s['ord-done-ic']}><CheckCircle2 size={40} strokeWidth={1.6} /></div>
      <div className={s['ord-done-title']}>Order placed!</div>
      <div className={s['ord-done-sub']}>
        {isCod
          ? 'Your physical card is on its way. Pay the courier on delivery.'
          : 'We\'re confirming your payment on-chain. Your physical card ships once it\'s verified.'}
      </div>

      {order?.ref && (
        <div className={s['ord-done-ref']}>
          <span>Order reference</span>
          <strong>{order.ref}</strong>
        </div>
      )}

      <div className={`${s['step-note']} ${s['step-note-green']}`} style={{ marginTop: 4 }}>
        {isCod
          ? <Truck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />
          : <Clock size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />}
        <span>Estimated delivery in <strong>7–10 business days</strong>. Same card number &amp; CVV as your virtual card. We&apos;ll email tracking updates.</span>
      </div>

      <button className={s['btn-primary']} style={{ width: '100%', padding: 13, fontSize: 14 }} onClick={onTrack}>
        Track my order
      </button>
      <button className={s['ord-done-close']} onClick={onClose}>Done</button>
    </div>
  );
}
