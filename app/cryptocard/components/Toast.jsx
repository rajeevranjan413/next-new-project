'use client';

import { useCryptoCard } from '../CryptoCardContext';
import s from '../cryptocard.module.css';

export default function Toast() {
  const { toast } = useCryptoCard();
  return (
    <div className={`${s.toast} ${toast.visible ? s.show : ''}`}>
      {toast.msg}
    </div>
  );
}
