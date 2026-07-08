'use client';

import { useCryptoCard } from '../../../CryptoCardContext';
import { CARD_THEMES } from '../../../config/theme';
import { PHONE_CODES, FORM_COUNTRIES } from '../../../config/content';
import { VirtualCard, PhysicalCard } from '../../cards';
import s from '../../../cryptocard.module.css';

export default function Step1Details({ t }) {
  const { form, setForm, nextStep, cardType, cardTheme } = useCryptoCard();
  const previewName  = `${form.firstName} ${form.lastName}`.trim().toUpperCase() || 'YOUR NAME';
  const selectedTheme = CARD_THEMES.find(th => th.id === cardTheme) || CARD_THEMES[0];

  return (
    <div className={`${s['step-panel']} ${s.active}`}>
      <div className={s['step-title']}>{t.step1Title}</div>
      <div className={s['step-sub']}>{t.step1Sub}</div>

      <div className={s['card-preview-sm']}>
        <div className={s['cps-lbl']}>{t.livePreview}</div>
        <div className={s['cps-card']}>
          {cardType === 'physical'
            ? <PhysicalCard />
            : <VirtualCard theme={selectedTheme} />}
        </div>
      </div>

      <div className={s['two-col']}>
        <div className={s.fg}>
          <label>{t.lblFirst}</label>
          <input type="text" placeholder="" value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div className={s.fg}>
          <label>{t.lblLast}</label>
          <input type="text" placeholder="" value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
        </div>
      </div>
      <div className={s.fg}>
        <label>{t.lblEmail}</label>
        <input type="email" placeholder="" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div className={s.fg}>
        <label>{t.lblDob}</label>
        <input type="date" value={form.dob}
          onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
      </div>
      <div className={s.fg}>
        <label>{t.lblPhone}</label>
        <div className={s['phone-row']}>
          <select className={s['cc-sel']} value={form.countryCode}
            onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}>
            {PHONE_CODES.map(pc => <option key={pc.id} value={pc.code} title={`${pc.name} (${pc.code})`}>{pc.label}</option>)}
          </select>
          <input className={s['ph-inp']} type="tel" placeholder=""
            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <div className={s.fg}>
        <label>{t.lblCountry}</label>
        <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
          <option value="">{t.selCountry}</option>
          {FORM_COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className={s['step-nav']}>
        <button className={s['btn-next']} onClick={() => nextStep(1)}>{t.btn1Next}</button>
      </div>
    </div>
  );
}
