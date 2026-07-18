'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowLeft, Check, Clock } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import CryptoPayPanel from './physical/CryptoPayPanel';
import s from '../../cryptocard.module.css';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

const TITLES = { amount: 'Add Funds', pay: 'Pay with Crypto', pending: 'Payment Received' };
const SUBS = {
  amount: 'Choose how much USDT you want to top up your wallet with.',
  pay:    'Send the exact amount to the address below, then confirm to submit your top-up request.',
  pending: '',
};

export default function AddFundsSheet() {
  const {
    sheet, closeSheet, walletFunds,
    user, setAuthSheetOpen, submitFundRequest, refreshUser, showToast,
  } = useCryptoCard();

  const [step, setStep]         = useState('amount');
  const [amount, setAmount]     = useState(50);
  const [custom, setCustom]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reqRef, setReqRef]     = useState('');

  const isOpen = sheet === 'addfunds';

  // Reset the flow every time the sheet opens, and re-pull the wallet balance so a
  // freshly-approved top-up is reflected on the "Current balance" line.
  useEffect(() => {
    if (!isOpen) return;
    setStep('amount');
    setAmount(50);
    setCustom('');
    setSubmitting(false);
    setReqRef('');
    refreshUser?.();
  }, [isOpen, refreshUser]);

  if (!isOpen) return null;

  const chosen = custom ? Number(custom) : amount;
  const validAmount = chosen > 0;

  const goPay = () => {
    if (!validAmount) return;
    // Funds credit a specific account, so a login is required.
    if (!user) { showToast('Please log in to add funds'); setAuthSheetOpen(true); return; }
    setStep('pay');
  };

  // The crypto pay panel calls this once the user taps "I've sent the payment".
  // Instead of crediting immediately, we raise a pending request for admin approval.
  const handleConfirmed = async ({ network, address } = {}) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitFundRequest({ amount: chosen, network, payAddress: address });
      setReqRef(res?.ref || '');
      setStep('pending');
    } catch (e) {
      showToast(e.message || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const backTarget = step === 'pay' ? 'amount' : null;

  return (
    <div
      className={`${s['sheet-bg']} ${s.open}`}
      onClick={(e) => e.target === e.currentTarget && closeSheet()}
    >
      <div className={s.sheet}>
        <div className={s['sh-handle']} />

        <div className={s['ord-head']}>
          {backTarget && (
            <button className={s['ord-back']} onClick={() => setStep(backTarget)} aria-label="Back">
              <ArrowLeft size={17} strokeWidth={2} />
            </button>
          )}
          <div className={s['sh-title']} style={{ marginBottom: 0 }}>
            <Wallet size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {TITLES[step]}
          </div>
        </div>

        {SUBS[step] && <div className={s['sh-sub']}>{SUBS[step]}</div>}

        {/* ── Step 1: choose amount ── */}
        {step === 'amount' && (
          <>
            <div className={s['af-bal']}>
              <span className={s['af-bal-lbl']}>Current balance</span>
              <span className={s['af-bal-val']}>{Number(walletFunds).toFixed(2)} USDT</span>
            </div>

            <div className={s['af-grid-lbl']}>Select amount</div>
            <div className={s['af-grid']}>
              {QUICK_AMOUNTS.map((a) => {
                const sel = !custom && amount === a;
                return (
                  <button
                    key={a}
                    className={`${s['af-chip']} ${sel ? s.sel : ''}`}
                    onClick={() => { setAmount(a); setCustom(''); }}
                  >
                    <span className={s['af-chip-tok']}>₮</span>{a}
                  </button>
                );
              })}
            </div>

            <div className={s['af-grid-lbl']} style={{ marginTop: 14 }}>Or enter a custom amount</div>
            <div className={s['af-custom']}>
              <span className={s['af-custom-tok']}>₮</span>
              <input
                className={s['af-input']}
                type="number"
                inputMode="decimal"
                min="1"
                placeholder="0.00"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ''))}
              />
              <span className={s['af-custom-cur']}>USDT</span>
            </div>

            <button
              className={s['btn-primary']}
              style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 18 }}
              disabled={!validAmount}
              onClick={goPay}
            >
              Continue · {validAmount ? `${chosen} USDT` : 'Enter amount'}
            </button>
          </>
        )}

        {/* ── Step 2: crypto payment (reuses the card-order pay panel) ── */}
        {step === 'pay' && (
          <CryptoPayPanel
            amount={chosen}
            placing={submitting}
            confirmLabel="I've sent the payment"
            onConfirm={handleConfirmed}
          />
        )}

        {/* ── Step 3: pending — awaiting admin approval ── */}
        {step === 'pending' && (
          <div className={s['af-done']}>
            <span className={s['af-done-ic']} style={{ background: 'var(--bnbg)', color: 'var(--bnb)' }}>
              <Clock size={40} strokeWidth={1.8} />
            </span>
            <div className={s['af-done-title']}>Payment request received</div>
            <div className={s['af-done-amt']}>{chosen} USDT</div>
            <div className={s['af-done-sub']}>
              We&apos;ve received your payment request. Your wallet will be updated once we
              confirm the payment — this usually happens shortly.
            </div>
            {reqRef && (
              <div className={s['af-bal']} style={{ marginTop: 14 }}>
                <span className={s['af-bal-lbl']}>Reference</span>
                <span className={s['af-bal-val']} style={{ fontSize: 14 }}>{reqRef}</span>
              </div>
            )}
            <button
              className={s['btn-primary']}
              style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              onClick={closeSheet}
            >
              <Check size={15} strokeWidth={2.5} /> Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
