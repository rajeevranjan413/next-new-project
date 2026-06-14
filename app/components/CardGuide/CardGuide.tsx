'use client';

import { useEffect } from 'react';
import './CardGuide.css';

export default function CardGuide() {
  useEffect(() => {
    // Cookie banner logic
    const COOKIE_KEY = 'cdg_cookie_consent';
    const banner = document.getElementById('cookie-banner');
    
    if (banner && !localStorage.getItem(COOKIE_KEY)) {
      requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
    }

    function saveConsent(value: string) {
      localStorage.setItem(COOKIE_KEY, value);
      if (banner) banner.classList.remove('is-visible');
    }

    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');
    const settingsBtn = document.getElementById('cookie-settings');

    acceptBtn?.addEventListener('click', () => saveConsent('accepted'));
    declineBtn?.addEventListener('click', () => saveConsent('essential'));
    settingsBtn?.addEventListener('click', () => {
      if (banner) banner.classList.add('is-visible');
    });

    // Modal logic
    document.querySelectorAll('[data-modal]').forEach((btn) => {
      btn.addEventListener('click', function () {
        const id = 'modal-' + (this as HTMLElement).getAttribute('data-modal');
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('is-open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      const closeBtn = overlay.querySelector('.modal__close');
      closeBtn?.addEventListener('click', function () {
        overlay.classList.remove('is-open');
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('is-open');
      });
    });

    // FAQ logic
    document.querySelectorAll('.faq__q').forEach((btn) => {
      btn.addEventListener('click', function () {
        const item = (this as HTMLElement).closest('.faq__item');
        const open = item?.classList.contains('is-open');
        
        document.querySelectorAll('.faq__item').forEach((el) => {
          el.classList.remove('is-open');
          const q = el.querySelector('.faq__q');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        
        if (!open && item) {
          item.classList.add('is-open');
          (this as HTMLElement).setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Escape key logic
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.is-open').forEach((el) => {
          el.classList.remove('is-open');
        });
      }
    });
  }, []);

  return (
    <>
      <header className="header">
        <div className="wrap header__inner">
          <div className="logo">
            <div className="logo__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            Card Guide
          </div>
          <nav className="nav" aria-label="Page sections">
            <a href="#how-it-works">How it works</a>
            <a href="#card-types">Card types</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <span className="hero__badge">Payment cards</span>
            <h1>Understanding payment and virtual cards</h1>
            <p>A simple educational page about how debit and prepaid cards work, what virtual cards are used for, and how to spend safely online and in stores.</p>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="wrap">
            <h2 className="section__title">How a typical card payment works</h2>
            <p className="section__subtitle">Whether you use a plastic card or a digital card in your phone, the basic flow is the same.</p>
            <div className="steps">
              <article className="step">
                <div className="step__num">1</div>
                <h3>Present the card</h3>
                <p>At checkout you tap, insert, or enter card details. The merchant sends the request to their payment processor.</p>
              </article>
              <article className="step">
                <div className="step__num">2</div>
                <h3>Authorization check</h3>
                <p>The card network and your bank verify available balance or credit limit, then approve or decline the transaction.</p>
              </article>
              <article className="step">
                <div className="step__num">3</div>
                <h3>Settlement</h3>
                <p>Approved amounts are transferred to the merchant, usually within one to three business days. You see the charge on your statement.</p>
              </article>
            </div>

            <div className="status-demo">
              <p className="status-demo__label">Example status (illustration only)</p>
              <div className="status-indicator">
                <span className="status-indicator__dot" aria-hidden="true"></span>
                Card network available
              </div>
              <p className="status-demo__note">This page is for general information only. It does not issue cards or process payments.</p>
            </div>
          </div>
        </section>

        <section className="section" id="card-types">
          <div className="wrap">
            <h2 className="section__title">Common card types</h2>
            <p className="section__subtitle">Short overview of formats you may encounter when choosing how to pay.</p>
            <div className="card-types">
              <article className="card-type">
                <h3>Debit card</h3>
                <p>Linked to a bank account. Spending is limited to funds you already have on deposit.</p>
              </article>
              <article className="card-type">
                <h3>Prepaid card</h3>
                <p>Loaded with a fixed balance in advance. Useful for budgeting or one-time purchases.</p>
              </article>
              <article className="card-type">
                <h3>Virtual card</h3>
                <p>Digital-only card number for online payments. Often issued instantly without physical plastic.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="basics">
          <div className="wrap">
            <div className="info-block">
              <h2>Good practices for card security</h2>
              <ul>
                <li>Never share your full card number, CVV, or PIN with anyone who contacts you unexpectedly.</li>
                <li>Enable transaction alerts in your banking app so you notice unfamiliar charges quickly.</li>
                <li>Use strong passwords and two-factor authentication for accounts linked to your cards.</li>
                <li>Review statements regularly and report unrecognized transactions to your card issuer.</li>
                <li>For online shopping, prefer merchants you trust and check that the checkout page uses encryption.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap">
            <h2 className="section__title">Frequently asked questions</h2>
            <p className="section__subtitle">General answers about payment cards and digital spending.</p>
            <div className="faq">
              <div className="faq__item">
                <button className="faq__q" type="button" aria-expanded="false">What is the difference between debit and credit?</button>
                <div className="faq__a">Debit cards draw from money you already have. Credit cards let you borrow up to a limit and pay later, often with interest if the balance is not cleared on time.</div>
              </div>
              <div className="faq__item">
                <button className="faq__q" type="button" aria-expanded="false">Are virtual cards safe for online use?</button>
                <div className="faq__a">Virtual cards can limit exposure because you can set spending caps or use a unique number per merchant. Safety still depends on keeping details private and using reputable sites.</div>
              </div>
              <div className="faq__item">
                <button className="faq__q" type="button" aria-expanded="false">Does this site issue payment cards?</button>
                <div className="faq__a">No. Card Guide is an independent informational resource. We do not sell cards, open accounts, or handle payments on this page.</div>
              </div>
              <div className="faq__item">
                <button className="faq__q" type="button" aria-expanded="false">Does this page collect personal or payment data?</button>
                <div className="faq__a">No registration or card details are required to read this content. See our Privacy Policy below for optional cookie preferences.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer__links">
            <button type="button" data-modal="terms">Terms of Service</button>
            <button type="button" data-modal="privacy">Privacy Policy</button>
            <button type="button" data-modal="license">License Agreement</button>
            <button type="button" id="cookie-settings">Cookie Settings</button>
          </div>
          <p className="footer__copy">© 2026 Card Guide. All rights reserved. Informational content only.</p>
        </div>
      </footer>

      <div className="cookie-banner is-visible" id="cookie-banner" role="dialog" aria-label="Cookie notice">
        <div className="cookie-banner__inner">
          <div className="cookie-banner__text">
            <strong>We use cookies</strong>
            This website may store minimal preferences in your browser (for example, whether you dismissed this notice). We do not use cookies for advertising or third-party tracking on this page.
          </div>
          <div className="cookie-banner__actions">
            <button className="btn btn--ghost" type="button" id="cookie-decline">Essential only</button>
            <button className="btn btn--primary" type="button" id="cookie-accept">Accept</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-terms" role="dialog" aria-modal="true" aria-labelledby="modal-terms-title">
        <div className="modal">
          <div className="modal__header">
            <h2 id="modal-terms-title">Terms of Service</h2>
            <button className="modal__close" type="button" aria-label="Close">×</button>
          </div>
          <div className="modal__body">
            <p><strong>Last updated:</strong> June 2026</p>
            <p>By accessing Card Guide you agree to these Terms of Service. This website provides general information about payment cards. Content is offered "as is" without warranty of any kind.</p>
            <h3>Use of content</h3>
            <p>You may read and reference the materials on this page for personal, non-commercial use. Reproduction or redistribution requires written permission.</p>
            <h3>Limitation of liability</h3>
            <p>Card Guide and its operators shall not be liable for any direct or indirect damages arising from use of this website.</p>
            <h3>Changes</h3>
            <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.</p>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-privacy" role="dialog" aria-modal="true" aria-labelledby="modal-privacy-title">
        <div className="modal">
          <div className="modal__header">
            <h2 id="modal-privacy-title">Privacy Policy</h2>
            <button className="modal__close" type="button" aria-label="Close">×</button>
          </div>
          <div className="modal__body">
            <p><strong>Last updated:</strong> June 2026</p>
            <p>Card Guide respects your privacy. This policy describes what minimal data may be processed when you visit this page.</p>
            <h3>Data we do not collect</h3>
            <p>We do not require account registration, payment information, or contact details to view this website.</p>
            <h3>Cookies and local storage</h3>
            <p>If you accept the cookie notice, we may store a single preference flag in your browser (localStorage) so the banner does not appear on every visit. No advertising or analytics cookies are set by this page.</p>
            <h3>Server logs</h3>
            <p>Your hosting provider may automatically log standard server data (IP address, browser type, access time) as part of normal web server operation.</p>
            <h3>Your rights</h3>
            <p>You can clear site data at any time through your browser settings.</p>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-license" role="dialog" aria-modal="true" aria-labelledby="modal-license-title">
        <div className="modal">
          <div className="modal__header">
            <h2 id="modal-license-title">License Agreement</h2>
            <button className="modal__close" type="button" aria-label="Close">×</button>
          </div>
          <div className="modal__body">
            <p><strong>Last updated:</strong> June 2026</p>
            <p>This License Agreement governs your use of the Card Guide website and its content.</p>
            <h3>Grant of license</h3>
            <p>We grant you a limited, non-exclusive, non-transferable license to access and view the content for personal informational purposes.</p>
            <h3>Restrictions</h3>
            <p>You may not copy, modify, distribute, or create derivative works from the site content without prior written consent.</p>
            <h3>Intellectual property</h3>
            <p>All text, layout, and design elements on this page are protected by applicable copyright laws.</p>
          </div>
        </div>
      </div>
    </>
  );
}
