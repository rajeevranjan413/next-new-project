'use client';

import { useEffect, useState } from 'react';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { createCardOrder, getMyOrders } from '../../../services/api';
import { ORDER_AMOUNT_USDT } from '../../../config/physicalCard';
import OrderDesign from './OrderDesign';
import OrderShipping from './OrderShipping';
import OrderPayment from './OrderPayment';
import OrderDone from './OrderDone';
import OrderTracking from './OrderTracking';
import OrderList from './OrderList';
import s from '../../../cryptocard.module.css';

const STEPS = ['design', 'shipping', 'payment'];
const TITLES = {
  loading:  'Physical Card',
  orders:   'Your Physical Cards',
  design:   'Order Physical Card',
  shipping: 'Shipping Address',
  payment:  'Payment',
  done:     'Order Confirmed',
  track:    'Track Order',
};
const SUBS = {
  loading:  '',
  orders:   'Tap an order to see its live delivery status, or order another card.',
  design:   'One-time 10 USDT fee · 7–10 business days delivery · Same card number & CVV as your virtual card.',
  shipping: 'Where should we deliver your physical card? All fields are required unless marked optional.',
  payment:  'Review your order and choose how you\'d like to pay.',
  done:     '',
  track:    'Live status of your physical-card order, updated as it moves through fulfilment.',
};

// Empty shipping form. Some fields are pre-filled from the applicant's details on open.
const emptyShipping = () => ({
  fullName: '', line1: '', line2: '', city: '', state: '',
  zip: '', country: '', countryCode: '+91', phone: '',
});

export default function PhysicalCardSheet() {
  const { sheet, closeSheet, physType, setPhysType, form, genCard, showToast } = useCryptoCard();

  const [step, setStep]         = useState('design');
  const [shipping, setShipping] = useState(emptyShipping);
  const [payMethod, setPayMethod] = useState(null);   // 'crypto' | 'cod'
  const [placing, setPlacing]   = useState(false);
  const [order, setOrder]       = useState(null);     // { ref, status }
  const [orders, setOrders]     = useState([]);       // the user's placed orders
  const [trackRef, setTrackRef] = useState(null);     // which order the tracker shows

  const isOpen = sheet === 'physical';

  // Each time the sheet opens, reset the order flow and decide the landing view: users
  // who already have physical-card orders see their list (with tracking + "order
  // another"); everyone else drops straight into the order wizard.
  useEffect(() => {
    if (!isOpen) return;
    setPayMethod(null);
    setOrder(null);
    setPlacing(false);
    setTrackRef(null);
    setShipping({
      ...emptyShipping(),
      fullName:    `${form.firstName} ${form.lastName}`.trim(),
      countryCode: form.countryCode || '+91',
      phone:       form.phone || '',
      country:     form.country || '',
    });

    let token = null;
    try { token = localStorage.getItem('cc_token'); } catch {}
    if (!token) { setOrders([]); setStep('design'); return; }

    let cancelled = false;
    setStep('loading');
    getMyOrders(token)
      .then((list) => {
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : [];
        setOrders(arr);
        setStep(arr.length ? 'orders' : 'design');
      })
      .catch(() => {
        if (cancelled) return;
        setOrders([]);
        setStep('design');
      });
    return () => { cancelled = true; };
  }, [sheet]); // eslint-disable-line react-hooks/exhaustive-deps

  const goShipping = () => {
    if (!physType) { showToast('Please choose a design!'); return; }
    setStep('shipping');
  };

  const goPayment = () => {
    const { fullName, line1, city, state, zip, country, phone } = shipping;
    if (!fullName || !line1 || !city || !state || !zip || !country || !phone) {
      showToast('Please fill all required fields!');
      return;
    }
    setStep('payment');
  };

  // Places the order via the backend (falls back to a local ref if unreachable).
  const placeOrder = async (method, extra = {}) => {
    if (placing) return;
    setPlacing(true);
    try {
      const res = await createCardOrder({
        design: physType,
        shipping,
        payMethod: method,
        payNetwork: extra.network || '',
        payAddress: extra.address || '',
        amount: ORDER_AMOUNT_USDT,
        cardLast4: (genCard?.num || '').replace(/\s/g, '').slice(-4),
      });
      setOrder(res);
      if (res?.ref) { try { localStorage.setItem('cc_last_order', res.ref); } catch {} }
      setStep('done');
    } catch {
      showToast('Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const stepIdx = STEPS.indexOf(step);

  // Where the header back-arrow returns to (null = hide it). 'design' and 'track' only
  // have a back target when the user reached them from their orders list.
  const backTarget = {
    shipping: 'design',
    payment:  'shipping',
    design:   orders.length ? 'orders' : null,
    track:    orders.length ? 'orders' : null,
  }[step] || null;
  const showBack = !!backTarget;

  return (
    <div
      className={`${s['sheet-bg']} ${isOpen ? s.open : ''}`}
      onClick={(e) => e.target === e.currentTarget && closeSheet()}
    >
      <div className={s.sheet}>
        <div className={s['sh-handle']} />

        <div className={s['ord-head']}>
          {showBack && (
            <button
              className={s['ord-back']}
              onClick={() => setStep(backTarget)}
              aria-label="Back"
            >
              <ArrowLeft size={17} strokeWidth={2} />
            </button>
          )}
          <div className={s['sh-title']} style={{ marginBottom: 0 }}>
            <Package size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {TITLES[step]}
          </div>
        </div>

        {/* Progress dots (design → shipping → payment) */}
        {(step === 'design' || step === 'shipping' || step === 'payment') && (
          <div className={s['ord-steps']}>
            {STEPS.map((k, i) => (
              <div key={k} className={s['ord-step']}>
                <span className={`${s['ord-dot']} ${stepIdx >= i ? s.on : ''}`}>{i + 1}</span>
                {i < 2 && <span className={`${s['ord-line']} ${stepIdx > i ? s.on : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {SUBS[step] && <div className={s['sh-sub']}>{SUBS[step]}</div>}

        {step === 'loading' && (
          <div className={s['trk-loading']}>
            <Loader2 size={16} className={s['cp-spin']} /> Loading your orders…
          </div>
        )}
        {step === 'orders' && (
          <OrderList
            orders={orders}
            onTrack={(ref) => { setTrackRef(ref); setStep('track'); }}
            onOrderAnother={() => setStep('design')}
          />
        )}
        {step === 'design' && (
          <OrderDesign physType={physType} setPhysType={setPhysType} onNext={goShipping} />
        )}
        {step === 'shipping' && (
          <OrderShipping shipping={shipping} setShipping={setShipping} onNext={goPayment} />
        )}
        {step === 'payment' && (
          <OrderPayment
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            placing={placing}
            onPlaceOrder={placeOrder}
          />
        )}
        {step === 'done' && (
          <OrderDone
            order={order}
            payMethod={payMethod}
            onClose={closeSheet}
            onTrack={() => { setTrackRef(order?.ref); setStep('track'); }}
          />
        )}
        {step === 'track' && (
          <>
            <OrderTracking initialRef={trackRef || order?.ref} />
            <button
              className={s['btn-primary']}
              style={{ width: '100%', padding: 13, fontSize: 14, marginTop: 16 }}
              onClick={closeSheet}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
