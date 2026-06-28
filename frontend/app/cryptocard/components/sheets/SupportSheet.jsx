'use client';

import { useState } from 'react';
import { CheckCircle, X, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../data';
import s from '../../cryptocard.module.css';

/* ── Brand-coloured social icons ── */
const TelegramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#229ED9" />
    <path d="M6.5 13.8l3.9 1.5 1.5 4.7c.1.3.5.4.7.2l2.2-1.8 3.8 2.8c.3.2.7 0 .8-.3l2.8-10.5c.1-.4-.3-.8-.7-.6L6.3 13c-.4.1-.4.7.2.8z" fill="white" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#25D366" />
    <path d="M14 6.5a7.5 7.5 0 0 0-6.5 11.2L6 22l4.4-1.4A7.5 7.5 0 1 0 14 6.5zm3.6 10.3c-.2.5-.9.9-1.5 1-.4 0-.9.1-2.7-.6-2.3-.9-3.7-3.2-3.8-3.4-.1-.1-.8-1.1-.8-2.1 0-1 .5-1.5.7-1.7.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5l-.3.4c-.1.1-.2.3-.1.5.4.7.9 1.3 1.5 1.8.6.4 1.2.7 1.5.8.2.1.4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.3.1.3-.1.8-.3 1.1z" fill="white" />
  </svg>
);

const EmailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#EA4335" />
    <path d="M7 10.5v8.5h14V10.5L14 16 7 10.5z" fill="white" />
    <path d="M7 9h14l-7 5.5L7 9z" fill="white" />
  </svg>
);

const CHANNELS = [
  { id: 'tg',    label: 'Telegram',  Icon: TelegramIcon,  placeholder: '@yourname',        hint: 'Telegram username' },
  { id: 'wa',    label: 'WhatsApp',  Icon: WhatsAppIcon,  placeholder: '+91 98765 43210',  hint: 'WhatsApp number with country code' },
  { id: 'email', label: 'Email',     Icon: EmailIcon,     placeholder: 'you@example.com',  hint: 'Your email address' },
];

export default function SupportSheet() {
  const { sheet, closeSheet, ticketSubmitted, setTicketSubmitted, showToast, lang, appConfig } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;

  const [channel, setChannel] = useState('tg');
  const [contact, setContact]   = useState('');
  const [desc, setDesc]         = useState('');

  const active = CHANNELS.find(c => c.id === channel);

  const submit = () => {
    if (!contact.trim()) { showToast(`Enter your ${active.hint}`); return; }
    if (!desc.trim())    { showToast('Please describe your issue'); return; }
    setTicketSubmitted(true);
  };

  const reset = () => { setContact(''); setDesc(''); setTicketSubmitted(false); };

  return (
    <div
      className={`${s['sheet-bg']} ${sheet === 'support' ? s.open : ''}`}
      onClick={e => e.target === e.currentTarget && closeSheet()}
    >
      <div className={s.sheet}>
        <div className={s['sh-handle']} />

        {/* Header */}
        <div className={s['sup-header']}>
          <div className={s['sup-hdr-left']}>
            <div className={s['sup-icon']}>
              <HeadphonesIcon size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className={s['sup-title']}>Support Center</div>
              <div className={s['sup-sub']}>
            {appConfig?.supportEmail || appConfig?.supportPhone
              ? `${appConfig.supportEmail || ''}${appConfig.supportEmail && appConfig.supportPhone ? ' · ' : ''}${appConfig.supportPhone || ''}`
              : 'Typically replies within 1–2 hours'}
          </div>
            </div>
          </div>
          <button className={s['sup-close']} onClick={closeSheet}><X size={18} /></button>
        </div>

        {!ticketSubmitted ? (
          <>
            {/* Channel selector */}
            <div className={s['sup-section-lbl']}>Choose contact method</div>
            <div className={s['sup-channels']}>
              {CHANNELS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`${s['sup-ch']} ${channel === id ? s['sup-ch-on'] : ''}`}
                  onClick={() => setChannel(id)}
                >
                  <Icon />
                  <span>{label}</span>
                  {channel === id && <div className={s['sup-ch-dot']} />}
                </button>
              ))}
            </div>

            {/* Contact input */}
            <div className={s['sup-field']}>
              <label className={s['sup-lbl']}>{active.hint}</label>
              <div className={s['sup-input-wrap']}>
                <div className={s['sup-input-icon']}><active.Icon /></div>
                <input
                  className={s['sup-input']}
                  type="text"
                  placeholder={active.placeholder}
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
              </div>
            </div>

            {/* Issue description */}
            <div className={s['sup-field']}>
              <label className={s['sup-lbl']}>Describe your issue</label>
              <textarea
                className={s['sup-textarea']}
                rows={3}
                placeholder="e.g. Card apply issue, voucher not credited, payment failed…"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button className={s['sup-submit']} onClick={submit}>
              Submit Ticket <ChevronRight size={16} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
            </button>

            {/* Quick links */}
            <div className={s['sup-quick']}>
              <div className={s['sup-quick-lbl']}>Quick help</div>
              {['How to apply for a card?', 'Card delivery timeline', 'How to top up wallet?'].map(q => (
                <div key={q} className={s['sup-quick-item']}>
                  <ChevronRight size={13} style={{ color: 'var(--bnb)', flexShrink: 0 }} />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Success state */
          <div className={s['sup-success']}>
            <div className={s['sup-success-icon']}>
              <CheckCircle size={52} strokeWidth={1.4} style={{ color: 'var(--green)' }} />
            </div>
            <div className={s['sup-success-title']}>Ticket Submitted!</div>
            <div className={s['sup-success-msg']}>
              Our team will reach out via <strong>{active?.label}</strong> within 1–2 hours.
            </div>
            <div className={s['sup-success-ref']}>
              Ref #{Math.random().toString(36).slice(2,8).toUpperCase()}
            </div>
            <button className={s['sup-submit']} onClick={reset} style={{ marginTop: 20 }}>
              Submit Another Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
