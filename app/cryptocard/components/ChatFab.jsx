'use client';

import { MessageCircle } from 'lucide-react';
import { useCryptoCard } from '../CryptoCardContext';
import s from '../cryptocard.module.css';

export default function ChatFab() {
  const { openSheet } = useCryptoCard();
  return (
    <button className={s['chat-fab']} onClick={() => openSheet('chat')}>
      <MessageCircle size={20} strokeWidth={2} />
      <div className={s.fdot} />
    </button>
  );
}
