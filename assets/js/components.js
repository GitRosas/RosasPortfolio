/**
 * components.js — single source of truth for shared nav & footer.
 * Loaded with defer before main.js so shared layout is present on DOMContentLoaded.
 * Each page keeps empty <nav> and <footer> placeholders; this script fills them.
 */
'use strict';
(function () {
  const I18N_CACHE_KEY = 'portfolioI18nCache';

  const getLanguage = () => (localStorage.getItem('portfolioLang') === 'pt' ? 'pt' : 'en');

  const getCachedTranslation = (lang, path) => {
    try {
      const raw = localStorage.getItem(I18N_CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
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
  };

  const applyCachedI18n = () => {
    const lang = getLanguage();
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const translated = getCachedTranslation(lang, key);
      if (translated) el.textContent = translated;
    });
  };

  const NAV_HTML = `
    <div class="container navbar-inner">
      <a class="navbar-brand" href="/">JM<span>Rosa</span><span class="brand-dot" aria-hidden="true"></span></a>
      <ul class="nav-links" id="nav-links">
        <li><a href="/" class="nav-link" data-i18n="nav.home">Home</a></li>
        <li><a href="/projects.html" class="nav-link" data-i18n="nav.projects">Projects</a></li>
        <li><a href="/about.html" class="nav-link" data-i18n="nav.about">About Me</a></li>
        <li><a href="/contact.html" class="nav-link" data-i18n="nav.contact">Contact</a></li>
        <li><a href="/login.html" class="nav-link nav-link-auth" data-i18n="nav.login">Login</a></li>
      </ul>
      <div class="navbar-actions">
        <button class="btn-theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme" title="Toggle theme">
          <svg class="icon icon-moon" aria-hidden="true"><use href="assets/img/icons.svg#moon"></use></svg>
          <svg class="icon icon-sun" aria-hidden="true"><use href="assets/img/icons.svg#sun"></use></svg>
        </button>
        <button class="nav-hamburger" id="nav-hamburger" type="button" aria-label="Open menu" aria-expanded="false">
          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </button>
      </div>
    </div>`;

  const FOOTER_HTML = `
    <div class="container">
      <div class="footer-top">
        <div>
          <div class="footer-brand">JM<span>Rosa</span></div>
          <p class="footer-desc" data-i18n="common.footerDesc">Engineer working with MBSE, SysML v2, ECSS/PUS and software for space systems - focused on connecting system models with the code that actually brings them to life.</p>
          <div class="footer-social-row" aria-label="Social media">
            <a href="https://github.com/GitRosas" target="_blank" rel="me noopener noreferrer" aria-label="GitHub"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#github"></use></svg></a>
            <a href="https://www.linkedin.com/in/joaorosa0409/" target="_blank" rel="me noopener noreferrer" aria-label="LinkedIn"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#linkedin-in"></use></svg></a>
            <a href="mailto:geral@joaomiguelrosa.com" aria-label="Email"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#envelope"></use></svg></a>
          </div>
        </div>
        <div>
          <h3 class="footer-heading" data-i18n="common.footerNavigation">Navigation</h3>
          <div class="footer-links">
            <a href="/" data-i18n="nav.home">Home</a>
            <a href="/projects.html" data-i18n="nav.projects">Projects</a>
            <a href="/about.html" data-i18n="nav.about">About Me</a>
            <a href="/contact.html" data-i18n="nav.contact">Contact</a>
          </div>
        </div>
        <div>
          <h3 class="footer-heading" data-i18n="common.footerContact">Contact</h3>
          <div class="footer-contact-item"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#phone"></use></svg><a href="tel:+351912705054">+351 912 705 054</a></div>
          <div class="footer-contact-item"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#envelope"></use></svg><a href="mailto:geral@joaomiguelrosa.com">geral@joaomiguelrosa.com</a></div>
          <div class="footer-contact-item"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#location-dot"></use></svg><span data-i18n="common.location">Coimbra, Portugal</span></div>
          <div class="footer-contact-item"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#github"></use></svg><a href="https://github.com/GitRosas" target="_blank" rel="me noopener noreferrer">GitRosas</a></div>
          <div class="footer-contact-item"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#linkedin-in"></use></svg><a href="https://www.linkedin.com/in/joaorosa0409/" target="_blank" rel="me noopener noreferrer">João Miguel Rosa</a></div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">&copy; <span id="footer-year">2026</span> João Miguel Rosa. All rights reserved.</p>
        <p class="footer-tech" data-i18n="common.footerMadeWith">Made using HTML5, CSS3 &amp; JavaScript</p>
        <a href="#" class="consent-settings-link" role="button" data-consent-settings data-i18n="consent.settingsLink">Cookie settings</a>
      </div>
    </div>`;

  const nav = document.getElementById('navbar');
  if (nav && !nav.innerHTML.trim()) nav.innerHTML = NAV_HTML;

  const footer = document.querySelector('footer.footer');
  if (footer && !footer.innerHTML.trim()) footer.innerHTML = FOOTER_HTML;

  applyCachedI18n();
})();
