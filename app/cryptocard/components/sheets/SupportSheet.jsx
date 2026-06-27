'use client';

import { useState } from 'react';
import { Send, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import { LANGS } from '../../data';
import s from '../../cryptocard.module.css';

export default function SupportSheet() {
  const { sheet, closeSheet, supportTab, setSupportTab, ticketSubmitted, setTicketSubmitted, showToast, lang } = useCryptoCard();
  const t = LANGS[lang] || LANGS.EN;
  const [contact, setContact] = useState('');
  const [desc, setDesc] = useState('');

  const submit = () => {
    if (!contact.trim() || !desc.trim()) { showToast('Please fill both fields!'); return; }
    setTicketSubmitted(true);
  };

  return (
    <div className={`${s['sheet-bg']} ${sheet === 'support' ? s.open : ''}`} onClick={e => e.target === e.currentTarget && closeSheet()}>
      <div className={s.sheet}>
        <div className={s['sh-handle']} />
        <div className={s['sh-title']}>{t.supportTitle}</div>
        <div className={s['sh-sub']}>{t.supportSub}</div>
        {!ticketSubmitted ? (
          <>
            <div className={s['t-tabs']}>
              <button className={`${s.ttab} ${supportTab === 'tg' ? s.on : ''}`} onClick={() => setSupportTab('tg')}>
                <Send size={13} strokeWidth={2} style={{ marginRight: 5, verticalAlign: 'middle' }} />Telegram
              </button>
              <button className={`${s.ttab} ${supportTab === 'wa' ? s.on : ''}`} onClick={() => setSupportTab('wa')}>
                <MessageCircle size={13} strokeWidth={2} style={{ marginRight: 5, verticalAlign: 'middle' }} />WhatsApp
              </button>
            </div>
            <div className={s.tf}>
              <label>{supportTab === 'tg' ? 'Telegram Username' : 'WhatsApp Number'}</label>
              <input type="text" placeholder={supportTab === 'tg' ? '@yourname' : '+91 98765 43210'} value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div className={s.tf}>
              <label>Describe your problem</label>
              <textarea placeholder="e.g. Card apply issue, voucher not credited…" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <button className={s['tf-sbtn']} onClick={submit}>{t.submitTicket}</button>
          </>
        ) : (
          <div className={s['t-ok']}>
            <div className={s.tok}><CheckCircle size={48} strokeWidth={1.5} style={{ color: 'var(--green)' }} /></div>
            <h4>Ticket Submitted!</h4>
            <p>Team will contact in 1–2 hours. Thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
}
