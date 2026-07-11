'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Copy, QrCode, EyeOff, Clock, Loader2, RefreshCw, Check } from 'lucide-react';
import {
  USDT_NETWORKS, DEFAULT_NETWORK, ORDER_AMOUNT_USDT,
  PAY_WINDOW_SECONDS, getNetwork,
} from '../../../config/physicalCard';
import { generatePaymentAddress } from '../../../services/api';
import { useCryptoCard } from '../../../CryptoCardContext';
import s from '../../../cryptocard.module.css';

const short = (a) => (a && a.length > 16 ? `${a.slice(0, 10)}…${a.slice(-8)}` : a);
const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

// Countdown ring — an SVG donut whose stroke shrinks as time runs out.
function CountdownRing({ remaining }) {
  const R = 15, C = 2 * Math.PI * R;
  const pct = Math.max(0, remaining) / PAY_WINDOW_SECONDS;
  const low = remaining <= 60;
  return (
    <span className={s['cp-ring-wrap']}>
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={R} fill="none" stroke="var(--bd2)" strokeWidth="3" />
        <circle
          cx="19" cy="19" r={R} fill="none"
          stroke={low ? 'var(--red)' : 'var(--bnb)'} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 19 19)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <Clock size={13} strokeWidth={2} className={s['cp-ring-ic']} />
    </span>
  );
}

export default function CryptoPayPanel({ placing, onConfirm }) {
  const { copyVal } = useCryptoCard();

  const [networkId, setNetworkId] = useState(DEFAULT_NETWORK);
  const [address, setAddress]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [qr, setQr]               = useState('');
  const [showQr, setShowQr]       = useState(false);
  const [remaining, setRemaining] = useState(PAY_WINDOW_SECONDS);
  const timerRef = useRef(null);
  const reqRef   = useRef(0);

  const net = getNetwork(networkId);
  const amount = `${ORDER_AMOUNT_USDT} USDT`;
  const expired = remaining <= 0;

  // Provision a fresh one-time address for the selected network, then build its QR.
  const provision = useCallback(async (id) => {
    const n = getNetwork(id);
    const reqId = ++reqRef.current;
    setLoading(true);
    setAddress('');
    setQr('');
    try {
      const { address: addr } = await generatePaymentAddress({
        network: n.id, prefix: n.prefix, amount: ORDER_AMOUNT_USDT,
      });
      if (reqId !== reqRef.current) return; // a newer request superseded this one
      setAddress(addr);
      setRemaining(PAY_WINDOW_SECONDS);
      const dataUrl = await QRCode.toDataURL(addr, {
        errorCorrectionLevel: 'H', margin: 1, width: 240,
        color: { dark: '#0b0e11', light: '#ffffff' },
      });
      if (reqId === reqRef.current) setQr(dataUrl);
    } finally {
      if (reqId === reqRef.current) setLoading(false);
    }
  }, []);

  // Generate on mount and whenever the network changes.
  useEffect(() => { provision(networkId); }, [networkId, provision]);

  // Tick the countdown once an address is live.
  useEffect(() => {
    if (!address) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((r) => (r <= 0 ? (clearInterval(timerRef.current), 0) : r - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [address]);

  return (
    <div className={s['cp-wrap']}>
      {/* Network selector */}
      <div className={s['cp-net-lbl']}>Select Network</div>
      <div className={s['cp-nets']}>
        {USDT_NETWORKS.map((n) => {
          const sel = networkId === n.id;
          return (
            <button
              key={n.id}
              className={`${s['cp-net']} ${sel ? s.sel : ''}`}
              style={sel ? { borderColor: n.color, background: n.bg } : {}}
              onClick={() => !loading && setNetworkId(n.id)}
              disabled={loading}
            >
              <span className={s['cp-net-dot']} style={{ background: n.color }} />
              <span className={s['cp-net-nm']}>{n.name}</span>
              <span className={s['cp-net-std']}>{n.standard}</span>
            </button>
          );
        })}
      </div>

      {/* Amount to pay */}
      <div className={s['cp-field']}>
        <div className={s['cp-field-lbl']}>Amount to pay</div>
        <div className={s['cp-amt-row']}>
          <span className={s['cp-amt']}>{amount}</span>
          <button className={s['cp-copy']} onClick={() => copyVal(String(ORDER_AMOUNT_USDT), 'Amount copied')}>
            <Copy size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* One-time payment address */}
      <div className={s['cp-field']}>
        <div className={s['cp-field-lbl']}>
          Payment unique address
          <span className={s['cp-badge']}>One-time use only</span>
        </div>
        <div className={s['cp-addr-row']}>
          {loading ? (
            <span className={s['cp-addr-loading']}>
              <Loader2 size={14} strokeWidth={2} className={s['cp-spin']} /> Generating secure address…
            </span>
          ) : (
            <>
              <span className={s['cp-addr']} title={address}>{short(address)}</span>
              <button className={s['cp-copy']} onClick={() => copyVal(address, 'Address copied')} disabled={!address}>
                <Copy size={14} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* QR toggle */}
      <button className={s['cp-qr-toggle']} onClick={() => setShowQr((v) => !v)} disabled={loading || !address}>
        {showQr ? <><EyeOff size={14} strokeWidth={2} /> Hide QR code</>
                : <><QrCode size={14} strokeWidth={2} /> Scan QR with another device</>}
      </button>

      {showQr && !loading && address && (
        <div className={s['cp-qr-box']}>
          <div className={s['cp-qr-img']}>
            <img src={qr} alt="Payment QR code" width={200} height={200} />
            <span className={s['cp-qr-logo']} style={{ borderColor: net.color }}>₮</span>
          </div>
          <div className={s['cp-qr-badge']} style={{ color: net.color, background: net.bg, borderColor: net.color }}>
            USDT · {net.standard}
          </div>
        </div>
      )}

      {/* Countdown / expiry */}
      {!loading && address && !expired && (
        <div className={s['cp-timer']}>
          <CountdownRing remaining={remaining} />
          <span className={s['cp-timer-txt']}>Expires in <strong>{mmss(remaining)}</strong></span>
        </div>
      )}
      {expired && (
        <div className={s['cp-expired']}>
          <span>This address has expired.</span>
          <button className={s['cp-regen']} onClick={() => provision(networkId)}>
            <RefreshCw size={13} strokeWidth={2} /> Generate new address
          </button>
        </div>
      )}

      <button
        className={s['btn-primary']}
        style={{ width: '100%', padding: 13, fontSize: 14, marginTop: 12 }}
        disabled={placing || loading || expired}
        onClick={() => onConfirm({ network: net.id, address })}
      >
        {placing ? 'Confirming…' : <><Check size={15} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />I&apos;ve sent the payment</>}
      </button>
    </div>
  );
}
