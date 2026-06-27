'use client';

import { ShieldCheck, X, Check, Link2, Globe, Lock, BadgeCheck, Eye } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import s from '../../cryptocard.module.css';

const NEVER = ['Fund transferred to us', 'Seed phrase asked', 'Auto-deduct without approval', 'Hidden charges'];
const ALWAYS = ['Read-only wallet link', 'Your approval every time', 'Fund stays with you', 'Transparent fees only'];
const HOW_STEPS = [
  { n: '1', title: 'You Choose Your Wallet', desc: 'MetaMask, Trust Wallet — only you decide which connects.' },
  { n: '2', title: 'Read-Only Permission', desc: 'We can ONLY see your address & balance. Cannot send anything automatically.' },
  { n: '3', title: 'Every Payment = Your Approval', desc: 'Popup appears in your wallet app every time. Confirm = payment. Cancel = nothing happens.' },
  { isCheck: true, title: 'Full Control — Always', desc: 'Disconnect anytime, lock card, set limits. We are the bridge, you hold the keys.', ok: true },
];
const BADGES = [
  { Icon: Lock, color: '#0ECB81', bg: 'rgba(14,203,129,.12)', name: '256-bit SSL', desc: 'Bank-level encryption' },
  { Icon: ShieldCheck, color: '#3b82f6', bg: 'rgba(59,130,246,.12)', name: 'PCI-DSS', desc: 'Card security standard' },
  { Icon: BadgeCheck, color: '#F0B90B', bg: 'rgba(240,185,11,.1)', name: 'KYC Verified', desc: 'Identity protection' },
  { Icon: Eye, color: '#a78bfa', bg: 'rgba(139,92,246,.12)', name: 'Non-Custodial', desc: 'Your keys, your crypto' },
];

export default function SafetyScreen({ active }) {
  const { screenFlash } = useCryptoCard();
  const flashing = screenFlash === 'safety';
  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`}>
      <div className={s['safety-screen']}>
        <div className={s['safety-hero']}>
          <div className={s['sh-ic']}>
            <ShieldCheck size={44} strokeWidth={1.5} style={{ color: 'var(--green)' }} />
          </div>
          <div className={s['sh-title-safe']}>Your Money — Always Yours</div>
          <div className={s['sh-sub-safe']}>
            CryptoCard Pro is 100% non-custodial. Your crypto never leaves your wallet without your explicit approval — every single time.
          </div>
        </div>

        <div className={s['compare-grid']}>
          <div className={s['cg-c']}>
            <div className={s['cg-lbl']} style={{ color: 'var(--red)' }}>
              <X size={13} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              NEVER Happens
            </div>
            {NEVER.map((item, i) => (
              <div key={i} className={s['cg-item']}>
                <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center' }}><X size={12} strokeWidth={2.5} /></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className={s['cg-c']}>
            <div className={s['cg-lbl']} style={{ color: 'var(--green)' }}>
              <Check size={13} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              ALWAYS Happens
            </div>
            {ALWAYS.map((item, i) => (
              <div key={i} className={s['cg-item']}>
                <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center' }}><Check size={12} strokeWidth={2.5} /></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s['how-wallet']}>
          <div className={s['hw-hdr']}>
            <Link2 size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            How Wallet Connection Works
          </div>
          <div className={s['hw-body']}>
            {HOW_STEPS.map((step, i) => (
              <div key={i} className={s['hw-step']}>
                <div className={`${s['hs-n']} ${step.ok ? s.ok : ''}`}>{step.isCheck ? <Check size={13} strokeWidth={3} /> : step.n}</div>
                <div>
                  <h5 style={step.ok ? { color: 'var(--green)' } : {}}>{step.title}</h5>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s['why-box']}>
          <h4>
            <Globe size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Why CryptoCard Exists
          </h4>
          <p>
            The world is moving to digital currency. You have crypto but can&apos;t use it at regular stores. CryptoCard Pro converts your crypto to local currency in real-time at every transaction —{' '}
            <strong style={{ color: 'var(--green)' }}>your money stays with you, we are the smart exchange bridge.</strong>
          </p>
        </div>

        <div className={s.badges}>
          {BADGES.map((b, i) => (
            <div key={i} className={s['badge-c']}>
              <div className={s['badge-ic']} style={{ background: b.bg, color: b.color }}>
                <b.Icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div className={s['badge-nm']}>{b.name}</div>
                <div className={s['badge-ds']}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
