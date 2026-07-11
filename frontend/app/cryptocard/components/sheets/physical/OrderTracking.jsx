'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Coins, Factory, Truck, Bike, Home, Check,
  Loader2, RefreshCw, Search, XCircle, Package, MapPin,
} from 'lucide-react';
import { ORDER_STAGES, stageIndex } from '../../../config/physicalCard';
import { trackOrder } from '../../../services/api';
import { useCryptoCard } from '../../../CryptoCardContext';
import s from '../../../cryptocard.module.css';

const ICONS = { check: CheckCircle2, coins: Coins, factory: Factory, truck: Truck, rider: Bike, home: Home };

const fmt = (at) =>
  at ? new Date(at).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

export default function OrderTracking({ initialRef }) {
  const { copyVal } = useCryptoCard();
  const [ref, setRef]     = useState(initialRef || '');
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (r) => {
    const q = String(r || '').trim().toUpperCase();
    if (!q) return;
    setLoading(true); setError('');
    try {
      const o = await trackOrder(q);
      setOrder(o); setRef(q);
      try { localStorage.setItem('cc_last_order', q); } catch {}
    } catch (e) {
      setOrder(null); setError(e.message || 'Order not found');
    } finally { setLoading(false); }
  }, []);

  // On open: track the passed ref, else the last order this device placed.
  useEffect(() => {
    let saved = initialRef;
    if (!saved && typeof window !== 'undefined') {
      try { saved = localStorage.getItem('cc_last_order'); } catch {}
    }
    if (saved) load(saved);
  }, [initialRef, load]);

  const cancelled = order?.status === 'cancelled';
  const curIdx    = order && !cancelled ? stageIndex(order.status) : -1;
  const tlMap     = {};
  (order?.timeline || []).forEach((t) => { tlMap[t.stage] = t; });

  return (
    <div className={s['trk-wrap']}>
      {/* Manual lookup */}
      <form
        className={s['trk-lookup']}
        onSubmit={(e) => { e.preventDefault(); load(input); }}
      >
        <Search size={14} strokeWidth={2} className={s['trk-lookup-ic']} />
        <input
          className={s['trk-lookup-inp']}
          placeholder="Enter order reference (e.g. CC-8F3KQ2)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className={s['trk-lookup-btn']} type="submit" disabled={loading}>Track</button>
      </form>

      {loading && (
        <div className={s['trk-loading']}><Loader2 size={16} className={s['cp-spin']} /> Fetching order status…</div>
      )}

      {!loading && error && (
        <div className={s['trk-empty']}>
          <Package size={26} strokeWidth={1.6} />
          <span>{error}</span>
          <span className={s['trk-empty-sub']}>Check the reference and try again.</span>
        </div>
      )}

      {!loading && order && (
        <>
          {/* Header: ref + destination */}
          <div className={s['trk-head']}>
            <div>
              <div className={s['trk-ref-lbl']}>Order reference</div>
              <div className={s['trk-ref']} onClick={() => copyVal(order.ref, 'Reference copied')}>
                {order.ref}
              </div>
            </div>
            <button className={s['trk-refresh']} onClick={() => load(order.ref)} aria-label="Refresh">
              <RefreshCw size={14} strokeWidth={2} />
            </button>
          </div>

          {order.shipTo && (
            <div className={s['trk-shipto']}>
              <MapPin size={13} strokeWidth={2} /> {order.name ? `${order.name} · ` : ''}{order.shipTo}
            </div>
          )}

          {cancelled ? (
            <div className={s['trk-cancelled']}>
              <XCircle size={16} strokeWidth={2} /> This order was cancelled. Contact support for help.
            </div>
          ) : (
            <div className={s['trk-timeline']}>
              {ORDER_STAGES.map((st, i) => {
                const done    = i < curIdx;
                const current = i === curIdx;
                const Icon    = ICONS[st.icon] || Check;
                const entry   = tlMap[st.id];
                const title   = order.payMethod === 'cod' && st.codTitle ? st.codTitle : st.title;
                const state   = done ? 'done' : current ? 'current' : 'pending';
                return (
                  <div key={st.id} className={`${s['trk-row']} ${s[`trk-${state}`]}`}>
                    <div className={s['trk-rail']}>
                      <span className={s['trk-node']}>
                        {done ? <Check size={13} strokeWidth={3} /> : <Icon size={14} strokeWidth={2} />}
                      </span>
                      {i < ORDER_STAGES.length - 1 && <span className={s['trk-line']} />}
                    </div>
                    <div className={s['trk-body']}>
                      <div className={s['trk-title']}>{title}</div>
                      <div className={s['trk-meta']}>
                        {entry ? fmt(entry.at) : (current ? 'In progress' : st.desc)}
                      </div>
                      {entry?.note && <div className={s['trk-note']}>{entry.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
