'use client';

import { FileText, Check } from 'lucide-react';
import { useCryptoCard } from '../../CryptoCardContext';
import s from '../../cryptocard.module.css';

export default function TermsSheet() {
  const { sheet, closeSheet, setTermsChecked } = useCryptoCard();

  const accept = () => {
    setTermsChecked(true);
    closeSheet();
  };

  return (
    <div className={`${s['sheet-bg']} ${sheet === 'terms' ? s.open : ''}`} onClick={e => e.target === e.currentTarget && closeSheet()}>
      <div className={s.sheet}>
        <div className={s['sh-handle']} />
        <div className={s['sh-title']}>
          <FileText size={17} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Terms & Reward Policy
        </div>
        <div className={s['terms-body']}>
          <h4>1. Welcome Bonus — 100 USDT Voucher</h4>
          <p>New users get a 100 USDT voucher on applying, shown separately in Voucher Balance (not Wallet Balance).</p>
          <h4>2. Claim Conditions</h4>
          <ul>
            <li>Minimum 100 USDT transaction required to unlock voucher</li>
            <li>Any transaction type counts — shopping, P2P, or payment</li>
            <li>Voucher auto-claimed once condition is met — no manual step</li>
            <li>One welcome bonus per account only</li>
          </ul>
          <h4>3. Balance Types</h4>
          <ul>
            <li><strong>Wallet Balance:</strong> Your actual crypto from connected wallet</li>
            <li><strong>Voucher Balance:</strong> Promotional bonus (locked until condition met)</li>
            <li><strong>Reward Balance:</strong> Cashback auto-credited after each transaction</li>
          </ul>
          <h4>4. Non-Custodial — Your Funds Are Safe</h4>
          <ul>
            <li>Funds NEVER leave your wallet without your explicit approval</li>
            <li>Wallet connects with read-only permission only</li>
            <li>Every transaction triggers an approval popup in your wallet app</li>
            <li>You can disconnect your wallet anytime</li>
          </ul>
          <h4>5. Physical Card — 10 USDT Fee</h4>
          <ul>
            <li>One-time 10 USDT for physical card delivery</li>
            <li>Standard or custom design — same card number &amp; CVV as virtual</li>
            <li>Delivery in 7–10 business days</li>
          </ul>
          <h4>6. Security</h4>
          <p>We will NEVER ask for your seed phrase, private key, or password. Anyone asking is a scammer — report immediately.</p>
        </div>
        <button className={s['terms-ok']} onClick={accept}>
          <Check size={14} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />Accept &amp; Close
        </button>
      </div>
    </div>
  );
}
