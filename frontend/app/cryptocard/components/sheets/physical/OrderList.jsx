'use client';

import { Package, ChevronRight, Plus } from 'lucide-react';
import { ORDER_STAGES, stageIndex } from '../../../config/physicalCard';
import s from '../../../cryptocard.module.css';

// Human label for an order's current stage (COD orders relabel the payment step).
const statusLabel = (o) => {
  if (o.status === 'cancelled') return 'Cancelled';
  const st = ORDER_STAGES[stageIndex(o.status)];
  if (!st) return o.status;
  return o.payMethod === 'cod' && st.codTitle ? st.codTitle : st.title;
};

const fmtDate = (at) =>
  at ? new Date(at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// The applicant's physical-card orders. Tap one to open its live tracker, or start a
// fresh order. Shown when the sheet opens for a user who already has orders.
export default function OrderList({ orders, onTrack, onOrderAnother }) {
  return (
    <div className={s['ord-list']}>
      {orders.map((o) => {
        const delivered = o.status === 'delivered';
        const cancelled = o.status === 'cancelled';
        const badgeCls = cancelled
          ? s['ord-badge-cancel']
          : delivered
            ? s['ord-badge-done']
            : s['ord-badge-active'];
        return (
          <button key={o.ref} className={s['ord-item']} onClick={() => onTrack(o.ref)}>
            <div className={s['ord-item-ic']}><Package size={20} strokeWidth={1.8} /></div>
            <div className={s['ord-item-body']}>
              <div className={s['ord-item-top']}>
                <span className={s['ord-item-ref']}>{o.ref}</span>
                <span className={`${s['ord-item-badge']} ${badgeCls}`}>{statusLabel(o)}</span>
              </div>
              <div className={s['ord-item-sub']}>
                {o.design === 'custom' ? 'Custom design' : 'Standard design'}
                {o.shipTo ? ` · ${o.shipTo}` : ''}
              </div>
              <div className={s['ord-item-date']}>Ordered {fmtDate(o.createdAt)}</div>
            </div>
            <ChevronRight size={16} strokeWidth={2} className={s['ord-item-chev']} />
          </button>
        );
      })}

      <button className={s['ord-order-another']} onClick={onOrderAnother}>
        <Plus size={16} strokeWidth={2.2} /> Order Another Card
      </button>
    </div>
  );
}
