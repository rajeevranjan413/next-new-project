'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Copy, QrCode, EyeOff, Clock, Loader2, RefreshCw, Check,
  ShieldCheck, Lock, Wallet, ChevronRight, X,
} from 'lucide-react';
import {
  USDT_NETWORKS, DEFAULT_NETWORK, ORDER_AMOUNT_USDT,
  PAY_WINDOW_SECONDS, getNetwork,
} from '../../../config/physicalCard';
import { generatePaymentAddress } from '../../../services/api';
import { useCryptoCard } from '../../../CryptoCardContext';
import s from '../../../cryptocard.module.css';

const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

// Render an address the way real wallets do: bold, high-contrast head + tail with
// the middle dimmed, wrapping across lines instead of an ellipsis. Reads as genuine.
function AddressDisplay({ address }) {
  if (!address) return null;
  const head = address.slice(0, 6);
  const tail = address.slice(-6);
  const mid = address.slice(6, -6);
  return (
    <span className={s['cp-addr']} title={address}>
      <span className={s['cp-addr-hl']}>{head}</span>
      <span className={s['cp-addr-mid']}>{mid}</span>
      <span className={s['cp-addr-hl']}>{tail}</span>
    </span>
  );
}

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

export default function CryptoPayPanel({
  placing, onConfirm,
  amount = ORDER_AMOUNT_USDT,
  confirmLabel = "I've sent the payment",
}) {
  const { copyVal } = useCryptoCard();

  const [networkId, setNetworkId] = useState(DEFAULT_NETWORK);
  const [address, setAddress]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [qr, setQr]               = useState('');
  const [showQr, setShowQr]       = useState(false);
  const [walletUiOpen, setWalletUiOpen] = useState(false);
  const [remaining, setRemaining] = useState(PAY_WINDOW_SECONDS);
  const timerRef = useRef(null);
  const reqRef   = useRef(0);

  const net = getNetwork(networkId);
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
        network: n.id, prefix: n.prefix, amount,
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
  }, [amount]);

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
      {/* Premium checkout header — token mark + secure badge */}
      <div className={s['cp-head']}>
        <span className={s['cp-head-token']}>₮</span>
        <div className={s['cp-head-txt']}>
          <div className={s['cp-head-title']}>Pay with USDT</div>
          <div className={s['cp-head-sub']}>Tether · {net.name}</div>
        </div>
        <span className={s['cp-head-secure']}>
          <ShieldCheck size={12} strokeWidth={2.2} /> Secure
        </span>
      </div>

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
              {sel && (
                <span className={s['cp-net-chk']} style={{ background: n.color }}>
                  <Check size={9} strokeWidth={3.5} />
                </span>
              )}
              <span className={s['cp-net-top']}>
                <span className={s['cp-net-dot']} style={{ background: n.color }} />
                <span className={s['cp-net-nm']}>{n.name}</span>
              </span>
              <span className={s['cp-net-std']}>{n.standard}</span>
            </button>
          );
        })}
      </div>

      {/* Amount hero */}
      <div className={s['cp-amt-card']}>
        <div className={s['cp-amt-head']}>
          <span className={s['cp-amt-lbl']}>Amount to pay</span>
          <button className={s['cp-amt-copy']} onClick={() => copyVal(String(amount), 'Amount copied')}>
            <Copy size={13} strokeWidth={2} /> Copy
          </button>
        </div>
        <div className={s['cp-amt-main']}>
          <span className={s['cp-amt-token']}>₮</span>
          <span className={s['cp-amt-val']}>{amount}</span>
          <span className={s['cp-amt-cur']}>USDT</span>
        </div>
        <div className={s['cp-amt-fiat']}>≈ ${Number(amount).toFixed(2)} USD · network fee included</div>
      </div>

      {/* One-time payment address */}
      <div className={s['cp-field']}>
        <div className={s['cp-field-lbl']}>
          Payment address
          <span className={s['cp-badge']}>One-time use</span>
        </div>
        <div className={`${s['cp-addr-row']} ${loading ? s['cp-addr-row-loading'] : ''}`}>
          {loading ? (
            <span className={s['cp-addr-loading']}>
              <Loader2 size={14} strokeWidth={2} className={s['cp-spin']} /> Generating secure address…
            </span>
          ) : (
            <>
              <AddressDisplay address={address} />
              <button className={s['cp-copy']} onClick={() => copyVal(address, 'Address copied')} disabled={!address}>
                <Copy size={14} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
        <div className={s['cp-addr-warn']}>
          <span className={s['cp-warn-dot']} style={{ background: net.color }} />
          Send only <strong>USDT ({net.standard})</strong> to this address
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

      {/* ── Divider: connect a wallet instead of sending manually ── */}
      <div className={s['cp-or']}><span>or pay in one tap</span></div>

      {/* Connect wallet — opens a placeholder interface for now. A third-party
          wallet-connect service will be mounted inside this panel later. */}
      <button
        className={s['cp-connect']}
        onClick={() => setWalletUiOpen((v) => !v)}
        disabled={loading || expired}
      >
        <span className={s['cp-connect-ic']}><Wallet size={16} strokeWidth={2.2} /></span>
        <span className={s['cp-connect-txt']}>Connect wallet</span>
        <ChevronRight size={16} strokeWidth={2.2} className={`${s['cp-connect-arw']} ${walletUiOpen ? s.open : ''}`} />
      </button>

      {walletUiOpen && (
        <div className={s['cp-wc']}>
          <div className={s['cp-wc-head']}>
            <span className={s['cp-wc-title']}>Connect a wallet</span>
            <button className={s['cp-wc-close']} onClick={() => setWalletUiOpen(false)} aria-label="Close">
              <X size={15} strokeWidth={2} />
            </button>
          </div>
          {/* TODO: mount the third-party wallet-connect widget here. */}
          <div className={s['cp-wc-body']}>
            <span className={s['cp-wc-ic']}><Wallet size={22} strokeWidth={1.8} /></span>
            <div className={s['cp-wc-msg']}>Wallet connection coming soon</div>
            <div className={s['cp-wc-sub']}>You&apos;ll be able to connect and pay directly from your wallet. For now, send the exact amount to the address above.</div>
          </div>
        </div>
      )}

      {/* Countdown / expiry */}
      {!loading && address && !expired && (
        <div className={s['cp-timer']}>
          <CountdownRing remaining={remaining} />
          <span className={s['cp-timer-txt']}>Address expires in <strong>{mmss(remaining)}</strong></span>
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
        style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 12, display:'flex', justifyContent:'center', alignItems:'center', gap: 6  }}
        disabled={placing || loading || expired}
        onClick={() => onConfirm({ network: net.id, address })}
      >
        {placing ? 'Confirming…' : <><Check size={15} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />{confirmLabel}</>}
      </button>

      {/* Trust footer — realistic on-chain security note */}
      <div className={s['cp-trust']}>
        <Lock size={12} strokeWidth={2} />
        Secured &amp; verified on-chain · never share your seed phrase
      </div>
    </div>
  );
}
