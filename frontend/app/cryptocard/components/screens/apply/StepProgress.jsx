'use client';

import { Check } from 'lucide-react';
import s from '../../../cryptocard.module.css';

const LABELS = ['Details', 'Plan', 'Design', 'Network', 'Done'];

export default function StepProgress({ step }) {
  return (
    <div className={s['step-progress']}>
      <div className={s['sp-row']}>
        {[1, 2, 3, 4, 5].map((n, i) => (
          <>
            <div key={`step-${n}`} className={s['sp-step']}>
              <div className={`${s['sp-dot']} ${step > n ? s.done : ''} ${step === n ? s.active : ''}`}>
                {step > n ? <Check size={10} strokeWidth={3} /> : n}
              </div>
            </div>
            {i < 4 && <div key={`line-${n}`} className={`${s['sp-line']} ${step > n ? s.done : ''}`} />}
          </>
        ))}
      </div>
      <div className={s['sp-labels']}>
        {LABELS.map((lbl, i) => (
          <div key={i} className={`${s['sp-lbl']} ${step === i + 1 ? s.active : ''} ${step > i + 1 ? s.done : ''}`}>
            {lbl}
          </div>
        ))}
      </div>
    </div>
  );
}
