'use client';

import { useState, useRef } from 'react';
import { Package, Headphones, Copy, CreditCard, Wallet, Gift, Star, ShieldCheck, Check, Truck } from 'lucide-react';
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
  const { applied, genCard, goScreen, openSheet, openInfo, copyVal, chosenWallet, walletBalance, lang, screenFlash, cardTheme, cardType } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  const flashing = screenFlash === 'card';
  const theme = CARD_THEMES.find(th => th.id === cardTheme) || CARD_THEMES[0];
  const isPhysical = cardType === 'physical';

  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`}>
      <div className={s['card-screen']}>
        {!applied ? (
          <CardShowcase />
        ) : (
          <div style={{ padding: '10px 14px' }}>
            {/* Active card — horizontal landscape with details on face */}
            <div
              className={s['h-card']}
              style={isPhysical
                ? { background: 'linear-gradient(155deg, #1c1c28 0%, #242430 55%, #1a1a24 100%)' }
                : theme.bgImage
                  ? { backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: theme.bg }}
            >
              <div className={s['h-card-gloss']} />

              {/* Top row: brand only */}
              <div className={s['h-card-top']}>
                <div className={s['h-card-brand']}>
                  <svg width="20" height="20" viewBox="0 0 26 26">
                    <polygon points="13,1 24,7 24,19 13,25 2,19 2,7" fill={isPhysical ? '#F0B90B' : theme.accent} />
                    <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="rgba(0,0,0,.48)" />
                  </svg>
                  <span style={{ color: isPhysical ? '#EAECEF' : theme.text, fontWeight: 800, fontSize: 13, letterSpacing: '.3px' }}>CryptoCard</span>
                </div>
              </div>

              {/* EMV chip — physical card only */}
              {isPhysical && (
                <div className={s['h-card-chip']}>
                  <svg width="36" height="27" viewBox="0 0 42 33">
                    <rect width="42" height="33" rx="5" fill="#c9a20a" />
                    <rect x="0" y="11" width="42" height="1.3" fill="rgba(0,0,0,.2)" />
                    <rect x="0" y="22" width="42" height="1.3" fill="rgba(0,0,0,.2)" />
                    <rect x="14" y="0" width="1.3" height="33" fill="rgba(0,0,0,.2)" />
                    <rect x="27" y="0" width="1.3" height="33" fill="rgba(0,0,0,.2)" />
                    <rect x="1"  y="1"  width="12" height="9"  rx="1.5" fill="#b8920a" />
                    <rect x="15" y="1"  width="11" height="9"  rx="1.5" fill="#b8920a" />
                    <rect x="28" y="1"  width="13" height="9"  rx="1.5" fill="#b8920a" />
                    <rect x="1"  y="23" width="12" height="9"  rx="1.5" fill="#b8920a" />
                    <rect x="15" y="23" width="11" height="9"  rx="1.5" fill="#b8920a" />
                    <rect x="28" y="23" width="13" height="9"  rx="1.5" fill="#b8920a" />
                  </svg>
                </div>
              )}

              {/* Card number */}
              <div className={s['h-card-num']} style={{ color: isPhysical ? '#EAECEF' : theme.text }}>
                {genCard?.num || '4729 •••• •••• ••••'}
              </div>

              {/* Bottom row: holder name + expiry / VISA */}
              <div className={s['h-card-foot']}>
                <div>
                  <div className={s['h-card-holder']} style={{ color: isPhysical ? '#EAECEF' : theme.text }}>
                    {genCard?.holder || 'CARD HOLDER'}
                  </div>
                  <div className={s['h-card-exp']}>Valid Thru {genCard?.exp || '--/--'}</div>
                </div>
                <span className={s['h-card-visa']} style={{ color: isPhysical ? '#EAECEF' : theme.text }}>VISA</span>
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

            {/* Track an existing physical-card order */}
            <button className={s['ca-track']} onClick={() => openSheet('track')}>
              <Truck size={16} strokeWidth={2} />
              <span>{t.trackOrder || 'Track Order'}</span>
              <span className={s['ca-track-sub']}>{t.trackOrderSub || 'Physical card delivery status'}</span>
            </button>

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
              <div className={`${s['bt-row']} ${s['bt-tap']}`} onClick={() => openInfo('voucher')} role="button" tabIndex={0}>
                <div className={s['bt-left']}>
                  <div className={s.btl}><Gift size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t.voucherBalance || 'Voucher Balance'}</div>
                  <div className={s.btv} style={{ color: 'var(--green)' }}>100.00 USDT</div>
                  <div className={s.bts}>{t.welcomeBonus || 'Welcome bonus'}</div>
                  <div className={s['btn-note']}>{t.claimNote || 'Do 100 USDT+ transaction to claim!'}</div>
                </div>
                <div className={s['bt-right']}><Gift size={22} strokeWidth={1.5} style={{ color: 'var(--green)' }} /></div>
              </div>
              <div className={`${s['bt-row']} ${s['bt-tap']}`} onClick={() => openInfo('rewards')} role="button" tabIndex={0}>
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
