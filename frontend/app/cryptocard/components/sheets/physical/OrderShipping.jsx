'use client';

import { PHONE_CODES, FORM_COUNTRIES } from '../../../config/content';
import s from '../../../cryptocard.module.css';

// Global-ready shipping address form. Layout, inputs and the phone-code row mirror
// the apply wizard's Step 1 so it feels identical to the rest of the app.
export default function OrderShipping({ shipping, setShipping, onNext }) {
  const set = (key) => (e) => setShipping((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <div className={s.fg}>
        <label>Full Name</label>
        <input type="text" autoComplete="name" value={shipping.fullName} onChange={set('fullName')} />
      </div>

      <div className={s.fg}>
        <label>Address Line 1</label>
        <input type="text" autoComplete="address-line1" placeholder="Street address, P.O. box" value={shipping.line1} onChange={set('line1')} />
      </div>

      <div className={s.fg}>
        <label>Address Line 2 <span className={s['fg-opt']}>(Optional)</span></label>
        <input type="text" autoComplete="address-line2" placeholder="Apartment, suite, unit, building, floor" value={shipping.line2} onChange={set('line2')} />
      </div>

      <div className={s['two-col']}>
        <div className={s.fg}>
          <label>City</label>
          <input type="text" autoComplete="address-level2" value={shipping.city} onChange={set('city')} />
        </div>
        <div className={s.fg}>
          <label>State / Province</label>
          <input type="text" autoComplete="address-level1" value={shipping.state} onChange={set('state')} />
        </div>
      </div>

      <div className={s['two-col']}>
        <div className={s.fg}>
          <label>Postal / ZIP Code</label>
          <input type="text" autoComplete="postal-code" inputMode="numeric" value={shipping.zip} onChange={set('zip')} />
        </div>
        <div className={s.fg}>
          <label>Country</label>
          <select value={shipping.country} onChange={set('country')}>
            <option value="">Select country</option>
            {FORM_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={s.fg}>
        <label>Phone Number</label>
        <div className={s['phone-row']}>
          <select className={s['cc-sel']} value={shipping.countryCode} onChange={set('countryCode')}>
            {PHONE_CODES.map((pc) => (
              <option key={pc.id} value={pc.code} title={`${pc.name} (${pc.code})`}>{pc.label}</option>
            ))}
          </select>
          <input className={s['ph-inp']} type="tel" autoComplete="tel" value={shipping.phone} onChange={set('phone')} />
        </div>
      </div>

      <button className={s['btn-primary']} style={{ width: '100%', padding: 13, fontSize: 14, marginTop: 4 }} onClick={onNext}>
        Continue to Payment
      </button>
    </>
  );
}
