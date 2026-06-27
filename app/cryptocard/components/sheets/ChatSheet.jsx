'use client';

import { useRef, useEffect, useState } from 'react';
import { Bot, Send, Ticket } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import s from '../../cryptocard.module.css';

const QUICK = [
  'Card ke kya fayede hain?',
  'Kya mera paisa safe hai?',
  '100 USDT voucher kaise claim karein?',
  'Kya yeh scam hai?',
];

export default function ChatSheet() {
  const { sheet, closeSheet, openSheet, chatMessages, chatTyping, sendChat } = useCryptoCard();
  const [input, setInput] = useState('');
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [chatMessages, chatTyping]);

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    sendChat(msg);
  };

  return (
    <div className={`${s['sheet-bg']} ${sheet === 'chat' ? s.open : ''}`} onClick={e => e.target === e.currentTarget && closeSheet()}>
      <div className={s.sheet}>
        <div className={s['sh-handle']} />
        <div className={s['sh-title']}>
          <Bot size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          AI Support
        </div>
        <div className={s['sh-sub']} style={{ marginBottom: 10 }}>Ask anything — card, crypto, wallet, safety!</div>

        <div className={s['c-msgs']} ref={msgsRef}>
          {chatMessages.map((m, i) => (
            <div key={i} className={`${s.cm} ${m.type === 'bot' ? s.bot : s.user}`}
              dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }}
            />
          ))}
          {chatTyping && (
            <div className={s.ctyp}>
              <span /><span /><span />
            </div>
          )}
        </div>

        <div className={s['cq-wrap']}>
          {QUICK.map((q, i) => (
            <button key={i} className={s.cq} onClick={() => { setInput(''); sendChat(q); }}>{q}</button>
          ))}
          <button className={s.cq} onClick={() => { closeSheet(); openSheet('support'); }}>
            <Ticket size={12} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />Human support
          </button>
        </div>

        <div className={s['c-inp-row']}>
          <input
            className={s['c-inp']}
            type="text"
            placeholder="Type your question…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className={s['c-send']} onClick={send}><Send size={15} strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  );
}
