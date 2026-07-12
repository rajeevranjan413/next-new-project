'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { CHAINS } from '../../../config/chains';
import { CryptoIcon } from '../../icons/CryptoIcon';
import s from '../../../cryptocard.module.css';

export default function Step4Wallet({ t }) {
  const {
    selectedChain, setSelectedChain,
    termsChecked, setTermsChecked,
    nextStep, prevStep, openSheet,
  } = useCryptoCard();

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['step-title']}>{t.step3Title}</div>
      <div className={s['step-sub']}>{t.step3Sub}</div>

      <div className={`${s['step-note']} ${s['step-note-green']}`}>
        <ShieldCheck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: 'var(--green)' }} />
        <span><strong>Wallet connected.</strong> Choose the blockchain network your card will settle on — this is where you'll top up and spend USDT.</span>
      </div>

      <div className={s['w-section-lbl']}>{t.selectWallet}</div>
      <div className={s.chgrid}>
        {CHAINS.map(c => {
          const sel = selectedChain === c.id;
          return (
            <div
              key={c.id}
              className={`${s.chb} ${sel ? s.sel : ''}`}
              onClick={() => setSelectedChain(c.id)}
            >
              <div className={s['chb-ic']}><CryptoIcon symbol={c.symbol} size={36} /></div>
              <div className={s['chb-body']}>
                <div className={s['chb-nm']}>{c.name}</div>
                <div className={s['chb-desc']}>{c.desc}</div>
              </div>
              <span className={s['chb-tag']}>{c.network}</span>
              <div className={s['chb-radio']}>
                {sel && <Check size={11} strokeWidth={3} />}
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
