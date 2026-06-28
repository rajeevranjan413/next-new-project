'use client';

import { useCryptoCard } from '../../../CryptoCardContext';
import { LANGS } from '../../../config/i18n';
import StepProgress  from './StepProgress';
import Step1Details  from './Step1Details';
import Step2Plan     from './Step2Plan';
import Step3Design   from './Step3Design';
import Step4Wallet   from './Step4Wallet';
import Step5Done     from './Step5Done';
import s from '../../../cryptocard.module.css';

export default function ApplyScreen({ active }) {
  const { step, lang, screenFlash } = useCryptoCard();
  const t        = LANGS[lang] || LANGS.EN;
  const flashing = screenFlash === 'apply';

  return (
    <div className={`${s.screen} ${active ? s.active : ''} ${flashing ? s['screen-flash'] : ''}`}>
      <StepProgress step={step} />
      {step === 1 && <Step1Details t={t} />}
      {step === 2 && <Step2Plan    t={t} />}
      {step === 3 && <Step3Design  t={t} />}
      {step === 4 && <Step4Wallet  t={t} />}
      {step === 5 && <Step5Done    t={t} />}
    </div>
  );
}
