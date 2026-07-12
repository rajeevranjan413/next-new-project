'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Smartphone, CreditCard } from 'lucide-react';
import { useCryptoCard } from '../../../CryptoCardContext';
import { CARD_THEMES } from '../../../config/theme';
import { VirtualCard, PhysicalCard } from '../../cards';
import s from '../../../cryptocard.module.css';

export default function Step3Design({ t }) {
  const { cardType, setCardType, cardTheme, setCardTheme, nextStep, prevStep, form, showToast } = useCryptoCard();
  const [idx, setIdx] = useState(() => Math.max(0, CARD_THEMES.findIndex(th => th.id === cardTheme)));
  const [connecting, setConnecting] = useState(false);
  const theme      = CARD_THEMES[idx];
  const holderName = `${form.firstName} ${form.lastName}`.trim().toUpperCase();

  const pick = (i) => { setIdx(i); setCardTheme(CARD_THEMES[i].id); };

  // Placeholder for the third-party wallet-connect SDK. For now we simulate a brief
  // handshake and, on success, advance to Step 4 (choose network). Swap the timeout
  // for the real provider call when the integration lands.
  const connectWallet = () => {
    if (connecting) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      showToast('Wallet connected!');
      nextStep(3);
    }, 1100);
  };

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['step-title']}>Choose Your Card</div>
      <div className={s['step-sub']}>Select type and colour theme</div>

      <div className={s['ct-toggle']}>
        <button className={`${s['ct-tab']} ${cardType === 'virtual' ? s.active : ''}`} onClick={() => setCardType('virtual')}>
          <Smartphone size={13} strokeWidth={2} />
          Virtual
          <span className={s['ct-free']}>FREE</span>
        </button>
        <button className={`${s['ct-tab']} ${cardType === 'physical' ? s.active : ''}`} onClick={() => setCardType('physical')}>
          <CreditCard size={13} strokeWidth={2} />
          Physical
          <span className={s['ct-fee']}>10 USDT</span>
        </button>
      </div>

      <div className={s['cd-stage']}>
        {cardType === 'virtual'
          ? <VirtualCard theme={theme} />
          : <PhysicalCard />}
      </div>

      <div className={s['cd-info']}>
        <div className={s['cd-name']}>{cardType === 'physical' ? 'Matte Black' : theme.name}</div>
        <div className={s['cd-sub']}>{cardType === 'physical' ? 'Standard · Physical Delivery' : theme.sub}</div>
      </div>

      {cardType === 'virtual' && (
        <div className={s['cd-swatches']}>
          {CARD_THEMES.map((th, i) => (
            <button
              key={th.id}
              className={`${s['cd-swatch']} ${i === idx ? s.active : ''}`}
              style={th.bgImage
                ? { backgroundImage: `url(${th.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: th.bg }}
              onClick={() => pick(i)}
              title={th.name}
            >
              {i === idx && (
                <span className={s['cd-swatch-check']}>
                  <Check size={9} strokeWidth={3} style={{ color: th.text }} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {cardType === 'physical' && (
        <div className={s['ct-phys-note']}>
          <ShieldCheck size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
          Delivered in 7–14 days · One-time flat fee of 10 USDT
        </div>
      )}

      <div className={s['step-nav']}>
        <button className={s['btn-back']} onClick={prevStep} disabled={connecting}>{t.btnBack}</button>
        <button className={s['btn-next']} onClick={connectWallet} disabled={connecting}>
          {connecting ? 'Connecting…' : 'Connect Wallet →'}
        </button>
      </div>
    </div>
  );
}
