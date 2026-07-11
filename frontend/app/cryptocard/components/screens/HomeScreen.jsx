'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard, FileText, Headphones, ShieldCheck, Globe, Zap, Gift, Wallet, Lock, Bot, Link, CheckCircle, ChevronRight, User } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { TICKER_DATA, BENEFITS, PLANS, LANGS, CARD_THEMES } from '../../data';
import { CryptoIcon } from '../icons/CryptoIcon';
import { PlanBadge } from '../icons/PlanBadge';
import { VirtualCard, PhysicalCard } from '../CardPreview';
import s from '../../cryptocard.module.css';

const LUCIDE_MAP = { Globe, Zap, Gift, Wallet, Lock, Bot, Link, CheckCircle };

/* All cards user can get — 6 virtual themes + 1 physical */
const PHYSICAL_SLOT = { id: 'physical', name: 'Matte Black', sub: 'Physical · Premium Matte' };
const DEMO_CARDS = [...CARD_THEMES, PHYSICAL_SLOT];

/* ── Live Activity feed data ── */
const FEED_NAMES = ['Rahul K.', 'Priya S.', 'Amir H.', 'Sofia L.', 'Raj M.', 'Fatima A.', 'Carlos R.', 'Meera P.'];
const FEED_ACTIONS = [
  { t: 'Card Applied', tag: 'a', e: '🃏' },
  { t: '100 USDT Claimed', tag: 'c', e: '🎁' },
  { t: 'Wallet Connected', tag: 'c', e: '🔗' },
  { t: 'Pro Plan Selected', tag: 'a', e: '⭐' },
];
const FEED_FLAGS = ['🇮🇳', '🇺🇸', '🇬🇧', '🇦🇪', '🇩🇪', '🇯🇵', '🇵🇰', '🇧🇩'];
const FEED_COLORS = ['#F0B90B', '#0ECB81', '#a78bfa', '#60a5fa'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function HomeScreen({ active }) {
  const { goScreen, openSheet, openInfo, stats, animateStats, hBal, hWallet, hWTag, hWTagStyle, hVouch, hVTag, hVTagStyle, lang, screenFlash } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  const flashing = screenFlash === 'home';

  /* ── Card carousel ── */
  const [cardIdx, setCardIdx] = useState(0);
  const touchStartX = useRef(null);
  const autoRef = useRef(null);
  const total = DEMO_CARDS.length;
  const current = DEMO_CARDS[cardIdx];

  const goTo = (i) => {
    clearInterval(autoRef.current);
    setCardIdx((i + total) % total);
    autoRef.current = setInterval(() => setCardIdx(d => (d + 1) % total), 3200);
  };

  useEffect(() => {
    autoRef.current = setInterval(() => setCardIdx(d => (d + 1) % total), 3200);
    return () => clearInterval(autoRef.current);
  }, [total]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(cardIdx + (diff > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  useEffect(() => {
    if (active) animateStats();
  }, [active, animateStats]);

  /* ── Live Activity feed ── */
  const [feed, setFeed] = useState([]);
  useEffect(() => {
    let id = 0;
    const make = () => {
      const d = new Date();
      const ts = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
      return { id: id++, nm: pick(FEED_NAMES), ac: pick(FEED_ACTIONS), fl: pick(FEED_FLAGS), cl: pick(FEED_COLORS), ts };
    };
    setFeed(Array.from({ length: 4 }, make));
    const iv = setInterval(() => setFeed(prev => [make(), ...prev].slice(0, 8)), 2800);
    return () => clearInterval(iv);
  }, []);

  const doubled = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`}>
      {/* Balance Hero */}
      <div className={s['bal-hero']}>
        <div className={s['bh-eyebrow']}>{t.totalPortfolio}</div>
        <div className={s['bh-val']}>{hBal}</div>
        <div className={s['bh-cols']}>
          <button className={s['bh-col']} onClick={() => goScreen('apply')}>
            <div className={s['bc-head']}>
              <span className={s['bc-dot']} style={{ background: 'var(--bnb)' }} />
              <span className={s['bc-lbl']}>{t.walletLbl}</span>
              <ChevronRight size={9} className={s['bc-arrow']} />
            </div>
            <div className={s['bc-val']}>{hWallet}</div>
            <div className={s['bc-badge']} style={{ background: 'var(--bnb)', color: 'var(--bnb-txt)' }}>{hWTag}</div>
          </button>
          <button className={s['bh-col']} onClick={() => openInfo('voucher')}>
            <div className={s['bc-head']}>
              <span className={s['bc-dot']} style={{ background: 'var(--green)' }} />
              <span className={s['bc-lbl']}>{t.voucherLbl}</span>
              <ChevronRight size={9} className={s['bc-arrow']} />
            </div>
            <div className={s['bc-val']} style={{ color: 'var(--green)' }}>{hVouch}</div>
            <div className={s['bc-badge']} style={hVTagStyle}>{hVTag}</div>
          </button>
          <button className={s['bh-col']} onClick={() => openInfo('rewards')}>
            <div className={s['bc-head']}>
              <span className={s['bc-dot']} style={{ background: 'var(--blue)' }} />
              <span className={s['bc-lbl']}>{t.rewardsLbl}</span>
              <ChevronRight size={9} className={s['bc-arrow']} />
            </div>
            <div className={s['bc-val']} style={{ color: 'var(--blue)' }}>0 USDT</div>
            <div className={s['bc-badge']} style={{ background: 'var(--bluebg)', color: 'var(--blue)' }}>{t.tagCashback}</div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={s['qa-row']} style={{ paddingTop: 14 }}>
        <button className={s.qa} onClick={() => goScreen('card')}>
          <div className={s['qa-ic']} style={{ background: 'var(--bnbg)', color: 'var(--bnb)' }}><CreditCard size={20} strokeWidth={1.8} /></div>
          <div className={s['qa-lbl']}>{t.qaCard}</div>
        </button>
        <button className={s.qa} onClick={() => goScreen('apply')}>
          <div className={s['qa-ic']} style={{ background: 'var(--gbg)', color: 'var(--green)' }}><FileText size={20} strokeWidth={1.8} /></div>
          <div className={s['qa-lbl']}>{t.qaApply}</div>
        </button>
        <button className={s.qa} onClick={() => openSheet('support')}>
          <div className={s['qa-ic']} style={{ background: 'var(--bluebg)', color: 'var(--blue)' }}><Headphones size={20} strokeWidth={1.8} /></div>
          <div className={s['qa-lbl']}>{t.qaSupport}</div>
        </button>
        <button className={s.qa} onClick={() => goScreen('safety')}>
          <div className={s['qa-ic']} style={{ background: 'rgba(139,92,246,.12)', color: '#a78bfa' }}><ShieldCheck size={20} strokeWidth={1.8} /></div>
          <div className={s['qa-lbl']}>{t.qaSafety}</div>
        </button>
      </div>

      {/* Ticker */}
      <div className={s.ticker} style={{ marginTop: 14 }}>
        <div className={s['tk-inner']}>
          {doubled.map((tk, i) => (
            <div key={i} className={s.tk}>
              <CryptoIcon symbol={tk.s} size={16} />
              <strong>{tk.s}</strong>&nbsp;${tk.p}&nbsp;
              <span className={tk.up ? s.up : s.dn}>{tk.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card Carousel Demo ── */}
      <div className={s['card-showcase']}>
        <div className={s['cs-lbl']}>{t.demoLbl || 'Available Card Designs'}</div>

        {/* Swipeable card */}
        <div
          className={s['demo-swiper']}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => goScreen('card')}
        >
          {current.id === 'physical'
            ? <PhysicalCard key="physical" />
            : <VirtualCard key={current.id} theme={current} />}
        </div>

        {/* Card name + sub */}
        <div className={s['demo-card-info']}>
          <div className={s['demo-card-name']}>{current.name}</div>
          <div className={s['demo-card-sub']}>{current.sub}</div>
        </div>

        {/* Dot indicators — tappable */}
        <div className={s['step-dots']}>
          {DEMO_CARDS.map((_, i) => (
            <div key={i} className={`${s.sd} ${i === cardIdx ? s.on : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 14px 6px' }}>
        <div className={s['sec-ht']}>{t.ourNumbers}</div>
      </div>
      <div className={s['stats-row']}>
        <div className={s['stat-p']}><div className={s['sp-n']}>{stats.s1.toLocaleString()}</div><div className={s['sp-l']}>Cards Issued</div></div>
        <div className={s['stat-p']}><div className={s['sp-n']}>{stats.s2}+</div><div className={s['sp-l']}>Countries</div></div>
        <div className={s['stat-p']}><div className={s['sp-n']}>{stats.s3.toLocaleString()}</div><div className={s['sp-l']}>USDT Paid</div></div>
        <div className={s['stat-p']}><div className={s['sp-n']}>{stats.s4.toLocaleString()}</div><div className={s['sp-l']}>Users</div></div>
      </div>

      {/* Benefits */}
      <div className={s['sec-h']}>
        <div className={s['sec-ht']}>{t.cardBenefits}</div>
      </div>
      <div className={s['ben-scroll']}>
        {BENEFITS.map((b, i) => {
          const BIcon = LUCIDE_MAP[b.icon];
          return (
            <div key={i} className={s['ben-card']}>
              <div className={s['bc-icon']} style={{ background: b.bg, color: b.color }}>
                {BIcon && <BIcon size={20} strokeWidth={1.8} />}
              </div>
              <div className={s['bc-title']}>{b.title}</div>
              <div className={s['bc-desc']}>{b.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Live Activity */}
      <div className={s['sec-h']}>
        <div className={s['live-hdr']}>
          <span className={s['live-dot']} />
          <div className={s['sec-ht']}>{t.liveActivity || 'Live Activity'}</div>
        </div>
        <span className={s['live-count']}>{stats.s4.toLocaleString()} {t.onlineNow || 'online'}</span>
      </div>
      <div className={s['feed-card']}>
        {feed.map(f => (
          <div key={f.id} className={s['feed-row']}>
            <div className={s['feed-av']} style={{ background: `${f.cl}18`, color: f.cl }}>
              <User size={14} strokeWidth={2} />
            </div>
            <div className={s['feed-info']}>
              <div className={s['feed-name']}>{f.nm} {f.fl}</div>
              <div className={s['feed-act']}>{f.ac.e} {f.ac.t}</div>
            </div>
            <span className={`${s['feed-badge']} ${f.ac.tag === 'c' ? s['fb-c'] : s['fb-a']}`}>{f.ac.t.split(' ')[0]}</span>
            <span className={s['feed-ts']}>{f.ts}</span>
          </div>
        ))}
      </div>

      {/* Plans Preview */}
      <div className={s['sec-h']}>
        <div className={s['sec-ht']}>{t.choosePlan}</div>
        <button className={s['sec-hl']} onClick={() => goScreen('apply')}>{t.applyNow}</button>
      </div>
      <div className={s['plan-scroll']}>
        {PLANS.map(plan => (
          <div key={plan.id} className={`${s['plan-c']} ${plan.popular ? s.feat : ''}`} onClick={() => goScreen('apply')}>
            {plan.popular && <div className={s['plan-pop']}>Popular</div>}
            <div className={s['pc-ico']}><PlanBadge plan={plan.id} size={36} /></div>
            <div className={s['pc-nm']} style={plan.nameColor ? { color: plan.nameColor } : {}}>{plan.name}</div>
            <div className={s['pc-pr']} style={plan.priceColor ? { color: plan.priceColor } : {}}>
              {plan.price} <span>{plan.priceSub}</span>
            </div>
            <ul className={s['pc-fl']}>
              {plan.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button className={`${s['pc-btn-s']} ${plan.btnClass === 'filled' ? s['pbs-f'] : s['pbs-o']}`}>
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '4px 14px 8px' }}>
        <button className={s['btn-primary']} style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={() => goScreen('apply')}>
          {t.bigCta}
        </button>
      </div>
    </div>
  );
}
