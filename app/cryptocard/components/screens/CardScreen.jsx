'use client';

import { useState, useRef } from 'react';
import { Package, Headphones, Copy, CreditCard, Wallet, Gift, Star, ShieldCheck, Check } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS, CARD_THEMES } from '../../data';
import { VirtualCard, PhysicalCard } from '../CardPreview';
import s from '../../cryptocard.module.css';

const CARD_DESC = {
  classic: 'Stealth dark design. Visa accepted at 190+ countries worldwide.',
  gold:    'Limited gold edition. BNB Signature · Premium finish.',
  emerald: 'Crypto green. Nature-inspired · Eco premium design.',
  ocean:   'Deep ocean blue. Pro user edition · Global POS.',
  royal:   'Royal purple prestige. Ultra-premium · Exclusive.',
  rose:    'Rose gold luxe. Signature edition · Visa everywhere.',
  physical:'Delivered in 7–14 days. No annual fee. Global ATM access.',
};

/* ── Card showcase — shown when user has no card yet ── */
function CardShowcase() {
  const { cardType, setCardType, cardTheme, setCardTheme, form, goScreen } = useCryptoCard();
  const [idx, setIdx] = useState(() => Math.max(0, CARD_THEMES.findIndex(th => th.id === cardTheme)));
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef(null);

  const theme = CARD_THEMES[idx];

  const goTo = (i) => {
    const next = ((i % CARD_THEMES.length) + CARD_THEMES.length) % CARD_THEMES.length;
    setIdx(next);
    setCardTheme(CARD_THEMES[next].id);
    setAnimKey(k => k + 1);
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(idx + (diff > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const isVirtual = cardType === 'virtual';
  const currentDesc = isVirtual ? (CARD_DESC[theme.id] || CARD_DESC.classic) : CARD_DESC.physical;
  const currentName = isVirtual ? theme.name : 'Matte Black';

  return (
    <div className={s['csc-root']}>

      {/* Segmented toggle */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className={s['csc-seg']}>
          <button
            className={`${s['csc-seg-tab']} ${isVirtual ? s.active : ''}`}
            onClick={() => setCardType('virtual')}
          >
            Virtual card
          </button>
          <button
            className={`${s['csc-seg-tab']} ${!isVirtual ? s.active : ''}`}
            onClick={() => setCardType('physical')}
          >
            Physical card
          </button>
        </div>
      </div>

      {/* Card preview — swipeable */}
      <div
        className={s['csc-card-area']}
        onTouchStart={isVirtual ? onTouchStart : undefined}
        onTouchEnd={isVirtual ? onTouchEnd : undefined}
      >
        <div key={isVirtual ? `v-${animKey}` : 'phys'} className={s['csc-card-enter']}>
          {isVirtual
            ? <VirtualCard theme={theme} />
            : <PhysicalCard />}
        </div>
      </div>

      {/* Card name + description */}
      <div className={s['csc-label']}>
        <div className={s['csc-label-name']}>{currentName}</div>
        <div className={s['csc-label-desc']}>{currentDesc}</div>
      </div>

      {/* Circle selectors — virtual only */}
      {isVirtual && (
        <div className={s['csc-circles']}>
          {CARD_THEMES.map((th, i) => (
            <button
              key={th.id}
              className={`${s['csc-circle']} ${i === idx ? s.active : ''}`}
              style={th.bgImage
                ? { backgroundImage: `url(${th.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: th.bg }}
              onClick={() => goTo(i)}
              title={th.name}
            />
          ))}
        </div>
      )}

      {/* Spacer if physical (no circles) */}
      {!isVirtual && <div style={{ flex: 1 }} />}

      {/* Apply CTA */}
      <div style={{ padding: '0 16px 20px' }}>
        <button
          className={s['csc-apply']}
          onClick={() => goScreen('apply')}
        >
          Apply for card · {isVirtual ? 'FREE' : '10 USDT'}
        </button>
      </div>

    </div>
  );
}

export default function CardScreen({ active }) {
  const { applied, genCard, goScreen, openSheet, copyVal, chosenWallet, walletBalance, lang, screenFlash } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  const flashing = screenFlash === 'card';

  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`}>
      <div className={s['card-screen']}>
        {!applied ? (
          <CardShowcase />
        ) : (
          <div style={{ padding: '10px 14px' }}>
            {/* Active card */}
            <div className={s['vc-card']}>
              <div className={s['vc-free']}>FREE</div>
              <div className={s['vc-active']}>ACTIVE</div>
              <div className={s['vc-chip']} />
              <div className={s['vc-num']}>{genCard?.num || '4729 •••• •••• ••••'}</div>
              <div className={s['vc-foot']}>
                <div>
                  <div className={s['vc-holder']}>{genCard?.holder || 'CARD HOLDER'}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                    Valid Thru <span>{genCard?.exp || '--/--'}</span>
                  </div>
                </div>
                <div className={s['vc-logo']}>
                  <svg width="12" height="12" viewBox="0 0 20 20" style={{ verticalAlign: 'middle', marginRight: 3 }}>
                    <polygon points="10,1 19,6.5 19,13.5 10,19 1,13.5 1,6.5" fill="#F0B90B" />
                  </svg>PRO
                </div>
              </div>
            </div>

            {/* Card details */}
            <div className={s['cd-tiles']}>
              <div className={s['cd-t']}>
                <div className={s['cd-l']}>Card Number</div>
                <div className={s['cd-v']} onClick={() => copyVal(genCard?.num, 'Card number copied!')}>
                  •••• <span>{genCard?.num?.slice(-4) || '0000'}</span>
                  <span className={s['copy-i']}><Copy size={13} strokeWidth={2} /></span>
                </div>
              </div>
              <div className={s['cd-t']}>
                <div className={s['cd-l']}>CVV <small style={{ color: 'var(--t3)' }}>(tap)</small></div>
                <div className={`${s['cd-v']} ${s['blur-cvv']}`} onClick={() => copyVal(genCard?.cvv, 'CVV copied!')}>
                  {genCard?.cvv || '---'} <span className={s['copy-i']}><Copy size={13} strokeWidth={2} /></span>
                </div>
              </div>
              <div className={s['cd-t']}>
                <div className={s['cd-l']}>Expiry</div>
                <div className={s['cd-v']}>{genCard?.exp || '--/--'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className={s['ca-grid']}>
              <button className={s['ca-btn']} onClick={() => openSheet('physical')}>
                <div className={s['ca-icon']}><Package size={20} strokeWidth={1.8} /></div>
                <div>
                  <div className={s['ca-title']}>{t.physCard}</div>
                  <div className={s['ca-sub']}>{t.physSub}</div>
                </div>
              </button>
              <button className={s['ca-btn']} onClick={() => openSheet('support')}>
                <div className={s['ca-icon']}><Headphones size={20} strokeWidth={1.8} /></div>
                <div>
                  <div className={s['ca-title']}>{t.caSupport}</div>
                  <div className={s['ca-sub']}>{t.caSupportSub}</div>
                </div>
              </button>
            </div>

            {/* Balance tiles */}
            <div className={s['bal-tiles']}>
              <div className={s['bt-row']}>
                <div className={s['bt-left']}>
                  <div className={s.btl}><Wallet size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t.walletBalance || 'Wallet Balance'}</div>
                  <div className={s.btv}>{walletBalance || '245.32'} USDT</div>
                  <div className={s.bts}>{t.yourWallet || 'Connected:'} {chosenWallet || 'wallet'}</div>
                </div>
                <div className={s['bt-right']}><Wallet size={22} strokeWidth={1.5} style={{ color: 'var(--bnb)' }} /></div>
              </div>
              <div className={s['bt-row']}>
                <div className={s['bt-left']}>
                  <div className={s.btl}><Gift size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t.voucherBalance || 'Voucher Balance'}</div>
                  <div className={s.btv} style={{ color: 'var(--green)' }}>100.00 USDT</div>
                  <div className={s.bts}>{t.welcomeBonus || 'Welcome bonus'}</div>
                  <div className={s['btn-note']}>{t.claimNote || 'Do 100 USDT+ transaction to claim!'}</div>
                </div>
                <div className={s['bt-right']}><Gift size={22} strokeWidth={1.5} style={{ color: 'var(--green)' }} /></div>
              </div>
              <div className={s['bt-row']}>
                <div className={s['bt-left']}>
                  <div className={s.btl}><Star size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t.rewardBalance || 'Reward Balance'}</div>
                  <div className={s.btv} style={{ color: '#60a5fa' }}>0.00 USDT</div>
                  <div className={s.bts}>{t.cashbackTx || 'Cashback from transactions'}</div>
                </div>
                <div className={s['bt-right']}><Star size={22} strokeWidth={1.5} style={{ color: '#60a5fa' }} /></div>
              </div>
            </div>

            <div style={{ background: 'var(--gbg)', border: '1px solid var(--gbd)', borderRadius: 10, padding: '11px 13px', fontSize: 12, color: 'var(--green)', marginBottom: 10 }}>
              <ShieldCheck size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t.securityNote || 'Your money stays in YOUR wallet. Every payment needs your explicit approval.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
