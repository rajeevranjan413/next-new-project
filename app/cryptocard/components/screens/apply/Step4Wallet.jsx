'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { WALLETS } from '../../../config/wallets';
import { WalletIcon } from '../../icons/WalletIcon';
import s from '../../../cryptocard.module.css';

export default function Step4Wallet({ t }) {
  const {
    connectedWalletId, connectingWalletId, pickWallet,
    termsChecked, setTermsChecked,
    nextStep, prevStep, openSheet,
  } = useCryptoCard();

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['step-title']}>{t.step3Title}</div>
      <div className={s['step-sub']}>{t.step3Sub}</div>

      <div className={`${s['step-note']} ${s['step-note-green']}`}>
        <ShieldCheck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />
        <span><strong>Your money never leaves your wallet.</strong> Read-only — we only see your balance. Every payment needs your explicit approval.</span>
      </div>

      <div className={s['w-section-lbl']}>{t.selectWallet}</div>
      <div className={s.wgrid}>
        {WALLETS.map(w => {
          const isConn       = connectedWalletId === w.id;
          const isConnecting = connectingWalletId === w.id;
          return (
            <div
              key={w.id}
              className={`${s.wb} ${isConn ? s.conn : ''} ${isConnecting ? s.connecting : ''}`}
              onClick={() => !connectedWalletId && !connectingWalletId && pickWallet(w)}
            >
              <div className={s['wb-ic']}><WalletIcon id={w.id} size={40} /></div>
              <div className={s['wb-nm']}>
                {isConn
                  ? <><Check size={11} strokeWidth={3} style={{ verticalAlign: 'middle', marginRight: 3 }} />Connected</>
                  : isConnecting
                    ? <span className={s['wb-securing']}>Securing…</span>
                    : w.name}
              </div>
            </div>
          );
        })}
      </div>

      <div className={s['terms-row']}>
        <input type="checkbox" id="termsChk" checked={termsChecked}
          onChange={e => setTermsChecked(e.target.checked)} />
        <label htmlFor="termsChk">
          I agree to the <a onClick={() => openSheet('terms')}>Terms & Conditions</a> and Reward Claim Policy.
        </label>
      </div>

      <div className={s['step-nav']}>
        <button className={s['btn-back']} onClick={prevStep}>{t.btnBack}</button>
        <button className={s['btn-next']} onClick={() => nextStep(4)}>{t.btn3Next}</button>
      </div>
    </div>
  );
}
