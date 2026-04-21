'use strict';
(function () {
  const CONSENT_KEY = 'portfolioAnalyticsConsent';
  const CONSENT_DATE_KEY = 'portfolioConsentDate';
  const I18N_CACHE_KEY = 'portfolioI18nCache';
  const REASK_AFTER_DAYS = 365;
  const IS_LOCAL_DEV = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

  let banner = null;
  let lastTrigger = null;

  function getLanguage() {
    return localStorage.getItem('portfolioLang') === 'pt' ? 'pt' : 'en';
  }

  function getI18nValue(path) {
    try {
      const raw = localStorage.getItem(I18N_CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const lang = getLanguage();
      let ref = data && typeof data === 'object' ? data[lang] : null;
      if (!ref || typeof ref !== 'object') return null;
      for (const part of path.split('.')) {
        if (!ref || typeof ref !== 'object') return null;
        ref = ref[part];
      }
      return typeof ref === 'string' ? ref : null;
    } catch (_) {
      return null;
    }
  }

  function t(path, fallback) {
    return getI18nValue(path) || fallback || path;
  }

  function route(path) {
    if (path === '/privacy') return IS_LOCAL_DEV ? 'privacy.html' : '/privacy';
    return path;
  }

  function shouldShowConsentBanner() {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      const dateRaw = localStorage.getItem(CONSENT_DATE_KEY);
      if (!consent) return true;
      if (!dateRaw) return true;

      const decidedAt = new Date(dateRaw).getTime();
      if (!Number.isFinite(decidedAt)) return true;

      const now = Date.now();
      const daysElapsed = (now - decidedAt) / (1000 * 60 * 60 * 24);
      return daysElapsed >= REASK_AFTER_DAYS;
    } catch (_) {
      return true;
    }
  }

  function dispatchConsentEvent(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  function setConsent(value) {
    const nowIso = new Date().toISOString();
    localStorage.setItem(CONSENT_KEY, value);
    localStorage.setItem(CONSENT_DATE_KEY, nowIso);
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
    banner.setAttribute('aria-modal', 'false');

    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  function showBanner() {
    if (!banner) return;
    banner.classList.add('is-visible');
    banner.setAttribute('aria-hidden', 'false');
    banner.setAttribute('aria-modal', 'true');

    const primaryAction = banner.querySelector('[data-consent-action="accept"]');
    window.setTimeout(() => {
      if (primaryAction && typeof primaryAction.focus === 'function') {
        primaryAction.focus();
      }
    }, 0);
  }

  function buildBanner() {
    if (banner) return banner;

    banner = document.createElement('aside');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-hidden', 'true');

    banner.innerHTML = [
      '<div class="consent-inner">',
      '  <h2 id="consent-title" class="consent-title" data-i18n="consent.title">Analytics consent</h2>',
      '  <p class="consent-message" data-i18n="consent.message">We use privacy-friendly first-party analytics to understand page usage and improve the portfolio. You can accept or decline, and change your decision anytime.</p>',
      '  <div class="consent-actions">',
      '    <button type="button" class="consent-btn" data-consent-action="accept" data-i18n="consent.accept">Accept</button>',
      '    <button type="button" class="consent-btn" data-consent-action="decline" data-i18n="consent.decline">Decline</button>',
      '  </div>',
      '  <a class="consent-more" href="#" data-i18n="consent.learnMore">Learn more</a>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    const moreLink = banner.querySelector('.consent-more');
    if (moreLink) {
      moreLink.setAttribute('href', route('/privacy'));
      moreLink.removeAttribute('target');
      moreLink.removeAttribute('rel');
    }

    banner.querySelector('[data-consent-action="accept"]').addEventListener('click', () => {
      setConsent('granted');
      hideBanner();
      dispatchConsentEvent('consent:granted');
    });

    banner.querySelector('[data-consent-action="decline"]').addEventListener('click', () => {
      setConsent('denied');
      hideBanner();
      dispatchConsentEvent('consent:denied');
    });

    return banner;
  }

  function openConsentBanner(trigger = null) {
    lastTrigger = trigger;
    buildBanner();
    showBanner();
  }

  function onKeyDown(event) {
    if (!banner || !banner.classList.contains('is-visible')) return;

    if (event.key === 'Escape') {
      hideBanner();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = banner.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindSettingsLink() {
    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-consent-settings]');
      if (!trigger) return;
      event.preventDefault();
      openConsentBanner(trigger);
    });
  }

  function init() {
    buildBanner();
    document.addEventListener('keydown', onKeyDown);
    bindSettingsLink();
    window.openConsentBanner = openConsentBanner;
    window.shouldShowConsentBanner = shouldShowConsentBanner;

    if (shouldShowConsentBanner()) {
      openConsentBanner(null);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
