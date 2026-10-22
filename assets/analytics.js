/* ---------------------------------------------------------------------------
 * Analytics for In the Public's Interest (IPI).
 *
 * SETUP — one line to change, below.
 *
 *   GA4 > Admin > Data streams > (your web stream) > Measurement ID
 *   It looks like  G-ABC1234XYZ
 *
 * Paste it into GA4_ID. Until a real ID is set, this file does nothing at all:
 * no script is loaded, no request is made, no cookie is set. It is safe to
 * deploy exactly as it ships.
 *
 * Privacy note: GA4 always anonymises IPs. The config below additionally turns
 * off Google Signals and ad personalisation, so this stays plain audience
 * measurement rather than advertising data — the right default for a health
 * non-profit. It does still set first-party analytics cookies; see the README
 * on consent and POPIA.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var GA4_ID = 'G-8YHDYWNYKH';

  // Deliberately strict: the placeholder above must fail this test, so a
  // forgotten setup step silently does nothing instead of sending bad data.
  if (!/^G-[A-Z0-9]{6,15}$/.test(GA4_ID)) { return; }

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  /* -------------------------------------------------------------------------
   * Conversion tracking.
   *
   * Every real enquiry to IPI leaves the site through WhatsApp or email, so
   * page views on their own say nothing about whether the site is working.
   * These two events are the ones worth reading in GA4.
   *
   * Mark `whatsapp_click` as a key event in GA4 > Admin > Events to see it as
   * a conversion.
   * ---------------------------------------------------------------------- */
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') { return; }

    var link = target.closest('a[href^="https://wa.me/"], a[href^="mailto:"]');
    if (!link) { return; }

    var isWhatsApp = link.href.indexOf('https://wa.me/') === 0;
    var section = link.closest('section');

    gtag('event', isWhatsApp ? 'whatsapp_click' : 'email_click', {
      // Drop the ?text= prefill so the event reads as a clean destination.
      link_url: link.href.split('?')[0],
      link_text: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      page_section: (section && section.id) || 'other'
    });
  }, true);
})();
