'use strict';

let allProjectsData = [];

document.addEventListener('DOMContentLoaded', async () => {
  initPageLoader();
  initTheme();
  await loadI18nData();
  initLanguageToggle();
  initConsentAnalyticsBridge();
  initAuthInfoPopup();
  initPhoneReveal();
  if (initProtectedRoutes()) return;
  initAnalyticsTracking();
  initAuthNavigation();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initFooterYear();
  initBackToTop();
  initParticles();
  initTypingEffect();
  initAutoProjectsCounter();
  initCounterAnimation();
  initCardTilt();
  initProjectsPage();
  initFeaturedProjects();
  initProjectModal();
  initContactForm();
  initLoginForm();
  initPortfolioSlider();
  initPortfolioLightbox();
  initDashboard();
  initCardGlow();
  initHeroParallax();
  initSmoothStagger();
});

const AUTH_STORAGE_KEY = 'portfolioAuth';

function getCurrentPageName() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const raw = (path.split('/').pop() || '').toLowerCase();
  if (raw.endsWith('.html')) return raw;
  if (!raw) return 'index.html';

  const routeMap = {
    index: 'index.html',
    register: 'register.html',
    login: 'login.html',
    projects: 'projects.html',
    about: 'about.html',
    contact: 'contact.html',
    dashboard: 'dashboard.html',
    portfolio: 'portfolio.html'
  };
  if (routeMap[raw]) return routeMap[raw];
  return 'index.html';
}
// Remove after 2026-10-01 once all legacy Supabase sessions expire.
const LEGACY_SUPABASE_STORAGE_KEY = 'sb-rcgwshnxndzaossmbken-auth-token';
const AUTH_SESSION_MS = 20 * 60 * 1000;
const LANGUAGE_STORAGE_KEY = 'portfolioLang';
const ANALYTICS_STORAGE_KEY = 'portfolioAnalytics';
const ANALYTICS_CONSENT_KEY = 'portfolioAnalyticsConsent';
let clientIpPromise = null;
let analyticsWriteQueue = Promise.resolve();

document.documentElement.lang = localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'pt' ? 'pt' : 'en';

const I18N_DATA_PATH = 'assets/data/i18n.json';
const I18N_CACHE_KEY = 'portfolioI18nCache';
let I18N = { en: {}, pt: {} };

async function loadI18nData() {
  try {
    const response = await fetch(I18N_DATA_PATH, { cache: 'default' });
    if (!response.ok) throw new Error('Failed to load i18n data');
    const data = await response.json();
    if (data && typeof data === 'object') {
      I18N = data;
      try {
        localStorage.setItem(I18N_CACHE_KEY, JSON.stringify(data));
      } catch (_) {
        // Ignore localStorage quota/access errors.
      }
      return;
    }
  } catch (_) {
    // Fallback to cached data when network loading fails.
  }

  try {
    const cachedRaw = localStorage.getItem(I18N_CACHE_KEY);
    if (!cachedRaw) return;
    const cachedData = JSON.parse(cachedRaw);
    if (cachedData && typeof cachedData === 'object') {
      I18N = cachedData;
    }
  } catch (_) {
    // Ignore invalid cache payloads.
  }
}

function getCurrentLanguage() {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === 'pt' ? 'pt' : 'en';
}

function i18nValue(path) {
  const lang = getCurrentLanguage();
  const parts = path.split('.');
  let ref = I18N[lang];
  for (const part of parts) {
    if (!ref || typeof ref !== 'object') return undefined;
    ref = ref[part];
  }
  return ref;
}

function t(path) {
  const ref = i18nValue(path);
  return typeof ref === 'string' ? ref : path;
}

function initLanguageToggle() {
  const actions = document.querySelector('.navbar-actions');
  if (!actions) return;

  let langBtn = document.getElementById('lang-toggle');
  if (!langBtn) {
    langBtn = document.createElement('button');
    langBtn.id = 'lang-toggle';
    langBtn.type = 'button';
    langBtn.className = 'btn-lang-toggle';
    actions.insertBefore(langBtn, actions.firstChild);
  }

  const syncLabel = () => {
    const lang = getCurrentLanguage();
    langBtn.textContent = lang === 'en' ? 'PT' : 'EN';
    langBtn.setAttribute('aria-label', lang === 'en' ? t('common.switchToPortuguese') : t('common.switchToEnglish'));
  };

  langBtn.addEventListener('click', () => {
    const next = getCurrentLanguage() === 'en' ? 'pt' : 'en';
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    applyTranslations();
    syncLabel();
  });

  applyTranslations();
  syncLabel();
}

function applyTranslations() {
  document.documentElement.lang = getCurrentLanguage();

  const setText = (selector, key) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = t(key);
  };

  const setHtml = (selector, key) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = i18nValue(key) || t(key);
  };

  const setAttr = (selector, attr, key) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, t(key));
  };

  const currentPage = getCurrentPageName();

  document.querySelectorAll('a[data-auth-link="logout"]').forEach(link => {
    link.textContent = t('nav.logout');
  });

  document.querySelectorAll('a[href="portfolio.html"], a[href="/portfolio"]').forEach(link => {
    if (link.classList.contains('nav-link') || link.closest('.footer-links')) {
      link.textContent = t('nav.portfolio');
    }
  });

  document.querySelectorAll('a[href="dashboard.html"], a[href="/dashboard"]').forEach(link => {
    if (link.classList.contains('nav-link') || link.closest('.footer-links')) {
      link.textContent = t('nav.dashboard');
    }
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  document.querySelectorAll('[data-i18n-template]').forEach(el => {
    const key = el.getAttribute('data-i18n-template');
    if (!key) return;
    let value = t(key);
    Object.entries(el.dataset).forEach(([datasetKey, datasetValue]) => {
      if (datasetKey === 'i18nTemplate') return;
      value = value.replaceAll(`{${datasetKey}}`, String(datasetValue));
    });
    el.textContent = value;
  });

  setText('.skip-link', 'common.skipToContent');

  const footerTech = document.querySelector('.footer-tech');
  if (footerTech) {
    const footerHtml = i18nValue('common.footerMadeWithHtml');
    if (typeof footerHtml === 'string' && footerHtml.includes('<')) {
      footerTech.innerHTML = footerHtml;
    } else {
      footerTech.textContent = t('common.footerMadeWith');
    }
  }

  if (currentPage === 'index.html' || currentPage === '') {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.innerHTML = `<span class="wave-emoji">👋</span> ${t('home.heroHi')}`;
    }
    setHtml('.hero-bio', 'home.heroBioHtml');

    const viewProjectsBtn = document.querySelector('.hero-buttons a[href="projects.html"]');
    if (viewProjectsBtn) viewProjectsBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#rocket"></use></svg> ${t('home.btnViewProjects')}`;
    const contactBtn = document.querySelector('.hero-buttons a[href="contact.html"]');
    if (contactBtn) contactBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#envelope"></use></svg> ${t('home.btnGetInTouch')}`;
    setText('.scroll-indicator span', 'home.scroll');

    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = t('home.statProjects');
    if (statLabels[1]) statLabels[1].textContent = t('home.statTechnologies');
    if (statLabels[2]) statLabels[2].textContent = t('home.statYears');
    if (statLabels[3]) statLabels[3].textContent = t('home.statDedication');

    setText('.section[aria-labelledby="services-heading"] .section-tag', 'home.tagWhatIDo');
    setText('#services-heading', 'home.expertiseTitle');
    setText('.section[aria-labelledby="services-heading"] .section-subtitle', 'home.expertiseSubtitle');

    const serviceCards = document.querySelectorAll('.services-grid .service-card');
    if (serviceCards[0]) {
      const h3 = serviceCards[0].querySelector('h3');
      const p = serviceCards[0].querySelector('p');
      if (h3) h3.textContent = t('home.service1Title');
      if (p) p.textContent = t('home.service1Desc');
    }
    if (serviceCards[1]) {
      const h3 = serviceCards[1].querySelector('h3');
      const p = serviceCards[1].querySelector('p');
      if (h3) h3.textContent = t('home.service2Title');
      if (p) p.textContent = t('home.service2Desc');
    }
    if (serviceCards[2]) {
      const h3 = serviceCards[2].querySelector('h3');
      const p = serviceCards[2].querySelector('p');
      if (h3) h3.textContent = t('home.service3Title');
      if (p) p.textContent = t('home.service3Desc');
    }

    setText('.section[aria-labelledby="tech-heading"] .section-tag', 'home.tagTechStack');
    setText('#tech-heading', 'home.techTitle');
    setText('.section[aria-labelledby="tech-heading"] .section-subtitle', 'home.techSubtitle');

    setText('.section[aria-labelledby="featured-heading"] .section-tag', 'home.tagPortfolio');
    setText('#featured-heading', 'home.featuredTitle');
    setText('.section[aria-labelledby="featured-heading"] .section-subtitle', 'home.featuredSubtitle');
    const viewAllBtn = document.querySelector('.section-cta a[href="projects.html"]');
    if (viewAllBtn) viewAllBtn.innerHTML = `${t('home.btnViewAll')} <svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#arrow-right"></use></svg>`;

    setText('.cta-banner h2', 'home.ctaTitle');
    setText('.cta-banner p', 'home.ctaSubtitle');
    const sendBtn = document.querySelector('.cta-banner a[href="contact.html"]');
    if (sendBtn) sendBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#paper-plane"></use></svg> ${t('home.btnSendMessage')}`;
    const callBtn = document.querySelector('.cta-banner a[href^="tel:"]');
    if (callBtn) callBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#phone"></use></svg> ${t('home.btnCallMe')}`;
  }

  if (currentPage === 'about.html') {
    setText('.page-header h1', 'about.headerTitle');
    setText('.page-header p', 'about.headerSubtitle');
    setText('.bio-role', 'about.bioRole');
    const bioLocation = document.querySelector('.bio-location');
    if (bioLocation) bioLocation.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#location-dot"></use></svg> ${t('common.location')}`;
    const cvBtn = document.querySelector('.bio-sidebar .btn.btn-primary');
    if (cvBtn) cvBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#download"></use></svg> ${t('about.btnDownloadCv')}`;

    const bioParagraphs = document.querySelectorAll('.bio-content p');
    if (bioParagraphs[0]) bioParagraphs[0].innerHTML = i18nValue('about.bioP1');
    if (bioParagraphs[1]) bioParagraphs[1].innerHTML = i18nValue('about.bioP2');
    if (bioParagraphs[2]) bioParagraphs[2].innerHTML = i18nValue('about.bioP3');

    const sectionTitles = document.querySelectorAll('.two-col .section-title');
    if (sectionTitles[0]) sectionTitles[0].innerHTML = `<svg class="icon icon-accent" aria-hidden="true"><use href="assets/img/icons.svg#briefcase"></use></svg> ${t('about.experienceTitle')}`;
    if (sectionTitles[1]) sectionTitles[1].innerHTML = `<svg class="icon icon-accent" aria-hidden="true"><use href="assets/img/icons.svg#graduation-cap"></use></svg> ${t('about.educationTitle')}`;

    const timelines = document.querySelectorAll('.timeline');
    if (timelines[0]) {
      const items = timelines[0].querySelectorAll('.timeline-item');
      for (let index = 0; index < 6; index += 1) {
        const item = items[index];
        if (!item) continue;
        const key = `about.exp${index + 1}`;
        const date = item.querySelector('.timeline-date');
        const title = item.querySelector('.timeline-title');
        const org = item.querySelector('.timeline-org');
        const desc = item.querySelector('.timeline-desc');
        if (date) date.textContent = t(`${key}Date`);
        if (title) title.textContent = t(`${key}Title`);
        if (org) org.textContent = t(`${key}Org`);
        if (desc) desc.textContent = t(`${key}Desc`);
      }
    }
    if (timelines[1]) {
      const items = timelines[1].querySelectorAll('.timeline-item');
      for (let index = 0; index < 2; index += 1) {
        const item = items[index];
        if (!item) continue;
        const key = `about.edu${index + 1}`;
        const date = item.querySelector('.timeline-date');
        const title = item.querySelector('.timeline-title');
        const org = item.querySelector('.timeline-org');
        const desc = item.querySelector('.timeline-desc');
        if (date) date.textContent = t(`${key}Date`);
        if (title) title.textContent = t(`${key}Title`);
        if (org) org.textContent = t(`${key}Org`);
        if (desc) desc.textContent = t(`${key}Desc`);
      }
    }

    setText('#skills-heading', 'about.skillsTitle');
    setText('#skills-heading + .section-subtitle', 'about.skillsSubtitle');
    const skillTitles = document.querySelectorAll('.skill-group-title');
    if (skillTitles[0]) skillTitles[0].innerHTML = `<svg class="icon icon-accent" aria-hidden="true"><use href="assets/img/icons.svg#satellite"></use></svg> ${t('about.domains')}`;
    if (skillTitles[1]) skillTitles[1].innerHTML = `<svg class="icon icon-accent" aria-hidden="true"><use href="assets/img/icons.svg#code"></use></svg> ${t('about.technologies')}`;
    if (skillTitles[2]) skillTitles[2].innerHTML = `<svg class="icon icon-accent" aria-hidden="true"><use href="assets/img/icons.svg#wrench"></use></svg> ${t('about.tools')}`;
  }

  if (currentPage === 'projects.html') {
    setText('.page-header h1', 'projects.headerTitle');
    setText('.page-header p', 'projects.headerSubtitle');
    setAttr('#project-search', 'placeholder', 'projects.searchPlaceholder');
    setAttr('#project-search', 'aria-label', 'projects.searchAria');
    if (!allProjectsData.length) {
      setText('#results-count', 'projects.loading');
    } else {
      const grid = document.getElementById('projects-grid');
      const filtersContainer = document.getElementById('project-filters');
      const resultsCount = document.getElementById('results-count');
      const searchInput = document.getElementById('project-search');
      if (grid && filtersContainer && resultsCount) {
        renderFilters(allProjectsData, filtersContainer);
        applyFilters(allProjectsData, 'All', searchInput ? searchInput.value : '', grid, resultsCount);
      }
    }
  }

  if ((currentPage === 'index.html' || currentPage === '') && allProjectsData.length) {
    const featuredGrid = document.getElementById('featured-projects');
    if (featuredGrid) renderProjects(allProjectsData.slice(0, 3), featuredGrid);
  }

  if (currentPage === 'contact.html') {
    setText('.page-header h1', 'contact.headerTitle');
    setText('.page-header p', 'contact.headerSubtitle');
    setText('.contact-grid .reveal-left .section-title', 'contact.formTitle');
    setText('.contact-grid .reveal-left .section-subtitle', 'contact.formSubtitle');

    const setLabel = (forId, key) => {
      const label = document.querySelector(`label[for="${forId}"]`);
      if (!label) return;
      const star = label.querySelector('span[aria-hidden="true"]');
      label.textContent = `${t(key)} `;
      if (star) label.appendChild(star);
    };

    setLabel('contact-name', 'contact.labelName');
    setLabel('contact-email', 'contact.labelEmail');
    setLabel('contact-subject', 'contact.labelSubject');
    setLabel('contact-message', 'contact.labelMessage');

    setAttr('#contact-name', 'placeholder', 'contact.placeholderName');
    setAttr('#contact-email', 'placeholder', 'contact.placeholderEmail');
    setAttr('#contact-subject', 'placeholder', 'contact.placeholderSubject');
    setAttr('#contact-message', 'placeholder', 'contact.placeholderMessage');

    const formErrors = document.querySelectorAll('.contact-form .form-error');
    if (formErrors[0]) formErrors[0].textContent = t('contact.errorName');
    if (formErrors[1]) formErrors[1].textContent = t('contact.errorEmail');
    if (formErrors[2]) formErrors[2].textContent = t('contact.errorSubject');
    if (formErrors[3]) formErrors[3].textContent = t('contact.errorMessage');

    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#paper-plane"></use></svg> ${t('contact.submit')}`;

    const successAlert = document.getElementById('form-alert-success');
    if (successAlert) successAlert.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#circle-check"></use></svg> ${t('contact.success')}`;
    const errorAlert = document.getElementById('form-alert-error');
    if (errorAlert) errorAlert.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#circle-xmark"></use></svg> ${t('contact.error')}`;

    setText('.contact-grid .reveal-right .section-title', 'contact.infoTitle');
    setText('.contact-grid .reveal-right .section-subtitle', 'contact.infoSubtitle');

    const infoLabels = document.querySelectorAll('.contact-info-label');
    if (infoLabels[0]) infoLabels[0].textContent = t('contact.phone');
    if (infoLabels[1]) infoLabels[1].textContent = t('contact.labelEmail');
    if (infoLabels[2]) infoLabels[2].textContent = t('contact.linkedin');
    if (infoLabels[3]) infoLabels[3].textContent = t('contact.github');
    if (infoLabels[4]) infoLabels[4].textContent = t('contact.locationLabel');
  }

  if (currentPage === 'login.html' || currentPage === 'register.html') {
    updateAuthInfoPopupText(currentPage);
  }
}

function initAuthInfoPopup() {
  const currentPage = getCurrentPageName();
  if (currentPage !== 'login.html' && currentPage !== 'register.html') return;

  const formCard = document.querySelector('main .section .reveal');
  if (!formCard) return;

  const popup = document.createElement('div');
  popup.className = 'auth-info-popup';
  popup.id = 'auth-info-popup';
  popup.setAttribute('role', 'status');
  popup.setAttribute('aria-live', 'polite');
  popup.setAttribute('data-page', currentPage);
  popup.innerHTML = `
    <button type="button" class="auth-info-popup-close" id="auth-popup-close" aria-label="Close">&times;</button>
    <p id="auth-popup-message"></p>
  `;

  const sectionTitle = formCard.querySelector('.section-title');
  if (sectionTitle) {
    formCard.insertBefore(popup, sectionTitle);
  } else {
    formCard.prepend(popup);
  }

  updateAuthInfoPopupText(currentPage);

  const closePopup = () => {
    popup.style.display = 'none';
  };

  const closeBtn = document.getElementById('auth-popup-close');

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
}

function updateAuthInfoPopupText(currentPage) {
  const popup = document.getElementById('auth-info-popup');
  if (!popup) return;

  const page = currentPage || popup.getAttribute('data-page');
  const message = document.getElementById('auth-popup-message');
  const closeBtn = document.getElementById('auth-popup-close');

  if (page === 'login.html') {
    if (message) {
      message.innerHTML = `${esc(t('authPopup.loginText'))} <a href="/contact">${esc(t('authPopup.contactLink'))}</a>.`;
    }
  } else {
    if (message) {
      message.innerHTML = `${esc(t('authPopup.registerText'))} <a href="/contact">${esc(t('authPopup.contactLink'))}</a>.`;
    }
  }

  if (closeBtn) closeBtn.setAttribute('aria-label', t('authPopup.close'));
}

/* ---- Auth Navigation ---- */
function initAuthNavigation() {
  const loggedIn = isAuthenticated();
  if (loggedIn) scheduleAutoLogout();

  const navLinksContainer = document.getElementById('nav-links');
  if (!navLinksContainer) return;

  let loginLink = navLinksContainer.querySelector('a.nav-link[href="login.html"], a.nav-link[href="/login"], a.nav-link[data-auth-link="logout"]');
  if (!loginLink) {
    if (loggedIn) {
      ensurePortfolioMenuItem(navLinksContainer, null);
      ensureDashboardMenuItem(navLinksContainer, null);
    } else {
      removePortfolioMenuItem(navLinksContainer);
      removeDashboardMenuItem(navLinksContainer);
    }
    return;
  }

  const loginListItem = loginLink.closest('li');

  if (loggedIn) {
    ensurePortfolioMenuItem(navLinksContainer, loginListItem);
    ensureDashboardMenuItem(navLinksContainer, loginListItem);
    loginLink.textContent = t('nav.logout');
    loginLink.setAttribute('href', '#');
    loginLink.setAttribute('data-auth-link', 'logout');
    loginLink.classList.add('nav-link-auth');
    loginLink.classList.remove('active');
    loginLink.removeAttribute('aria-current');
  } else {
    removePortfolioMenuItem(navLinksContainer);
    removeDashboardMenuItem(navLinksContainer);
    loginLink.textContent = t('nav.login');
    loginLink.setAttribute('href', '/login');
    loginLink.removeAttribute('data-auth-link');
    loginLink.classList.add('nav-link-auth');
  }

  navLinksContainer.addEventListener('click', e => {
    const logoutLink = e.target.closest('a[data-auth-link="logout"]');
    if (!logoutLink) return;
    e.preventDefault();
    trackEvent('logout_click');
    clearAuthSession();
    window.location.href = '/login';
  });
}

function initProtectedRoutes() {
  const currentPage = getCurrentPageName();
  if (currentPage !== 'dashboard.html' && currentPage !== 'portfolio.html') return false;
  if (isAuthenticated()) return false;
  window.location.replace('/login');
  return true;
}

function ensurePortfolioMenuItem(navLinksContainer, loginListItem) {
  let portfolioItem = navLinksContainer.querySelector('li[data-auth-item="portfolio"]');
  if (!portfolioItem) {
    portfolioItem = document.createElement('li');
    portfolioItem.setAttribute('data-auth-item', 'portfolio');
    const link = document.createElement('a');
    link.href = '/portfolio';
    link.className = 'nav-link';
    link.textContent = t('nav.portfolio');
    portfolioItem.appendChild(link);
    if (loginListItem) navLinksContainer.insertBefore(portfolioItem, loginListItem);
    else navLinksContainer.appendChild(portfolioItem);
  }
}

function ensureDashboardMenuItem(navLinksContainer, loginListItem) {
  let dashboardItem = navLinksContainer.querySelector('li[data-auth-item="dashboard"]');
  if (!dashboardItem) {
    dashboardItem = document.createElement('li');
    dashboardItem.setAttribute('data-auth-item', 'dashboard');
    const link = document.createElement('a');
    link.href = '/dashboard';
    link.className = 'nav-link';
    link.textContent = t('nav.dashboard');
    dashboardItem.appendChild(link);
    if (loginListItem) navLinksContainer.insertBefore(dashboardItem, loginListItem);
    else navLinksContainer.appendChild(dashboardItem);
  }
}

function removePortfolioMenuItem(navLinksContainer) {
  const portfolioItem = navLinksContainer.querySelector('li[data-auth-item="portfolio"]');
  if (portfolioItem) portfolioItem.remove();
}

function removeDashboardMenuItem(navLinksContainer) {
  const dashboardItem = navLinksContainer.querySelector('li[data-auth-item="dashboard"]');
  if (dashboardItem) dashboardItem.remove();
}

function isAuthenticated() {
  try {
    const auth = getStoredAuthSession();
    if (!auth || !auth.token || !auth.loggedInAt) return false;
    return Date.now() < auth.loggedInAt + AUTH_SESSION_MS;
  } catch (_) {
    return false;
  }
}

function scheduleAutoLogout() {
  try {
    const auth = getStoredAuthSession();
    if (!auth || !auth.loggedInAt) return;
    const logoutAt = auth.loggedInAt + AUTH_SESSION_MS;

    const remaining = logoutAt - Date.now();
    if (remaining <= 0) {
      clearAuthSession();
      window.location.href = '/login';
      return;
    }

    window.setTimeout(() => {
      clearAuthSession();
      window.location.href = '/login';
    }, remaining);
  } catch (_) {
    clearAuthSession();
  }
}

function getStoredAuthSession() {
  try {
    const currentRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (currentRaw) {
      const currentParsed = JSON.parse(currentRaw);
      if (currentParsed && typeof currentParsed === 'object') {
        const token = typeof currentParsed.token === 'string' ? currentParsed.token.trim() : '';
        const loggedInAt = Number(currentParsed.loggedInAt);
        if (token && Number.isFinite(loggedInAt)) {
          return { token, loggedInAt };
        }
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_SUPABASE_STORAGE_KEY);
    if (!legacyRaw) return null;
    const legacyParsed = JSON.parse(legacyRaw);
    if (!legacyParsed || typeof legacyParsed !== 'object') return null;

    const token = typeof legacyParsed.access_token === 'string' ? legacyParsed.access_token.trim() : '';
    const createdAt = legacyParsed.created_at ? Date.parse(legacyParsed.created_at) : NaN;
    const loggedInAt = Number.isFinite(createdAt) ? createdAt : Date.now();
    if (!token) return null;

    return { token, loggedInAt };
  } catch (_) {
    return null;
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_SUPABASE_STORAGE_KEY);
}

function getAnalyticsData() {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return {
        counts: {
          site_entry: 0,
          cv_click: 0,
          form_submit: 0,
          github_click: 0,
          linkedin_click: 0,
          login_success: 0,
          dashboard_visit: 0,
          portfolio_visit: 0
        },
        events: []
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed.counts || !parsed.events) throw new Error('Invalid analytics data');
    return parsed;
  } catch (_) {
    return {
      counts: {
        site_entry: 0,
        cv_click: 0,
        form_submit: 0,
        github_click: 0,
        linkedin_click: 0,
        login_success: 0,
        dashboard_visit: 0,
        portfolio_visit: 0
      },
      events: []
    };
  }
}

function saveAnalyticsData(data) {
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
}

async function getClientIp() {
  if (!hasAnalyticsConsent()) return '';
  if (clientIpPromise) return clientIpPromise;

  clientIpPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch('https://api64.ipify.org?format=json', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) return 'unknown';
      const payload = await response.json();
      return (payload && typeof payload.ip === 'string' && payload.ip.trim()) ? payload.ip.trim() : 'unknown';
    } catch (_) {
      return 'unknown';
    }
  })();

  return clientIpPromise;
}

function hasAnalyticsConsent() {
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted';
  } catch (_) {
    return false;
  }
}

function initConsentAnalyticsBridge() {
  document.addEventListener('consent:granted', () => {
    trackEvent('consent_granted');
    trackEvent('site_entry');

    const currentPage = getCurrentPageName();
    if (currentPage === 'dashboard.html' || currentPage === 'dashboard') {
      trackEvent('dashboard_visit');
    }
    if (currentPage === 'portfolio.html' || currentPage === 'portfolio') {
      trackEvent('portfolio_visit');
    }
  });

  document.addEventListener('consent:denied', () => {
    // Explicitly no analytics writes when consent is denied.
  });
}

function trackEvent(name, details) {
  if (!hasAnalyticsConsent()) return Promise.resolve();

  analyticsWriteQueue = analyticsWriteQueue.then(async () => {
    const data = getAnalyticsData();
    if (!Object.prototype.hasOwnProperty.call(data.counts, name)) {
      data.counts[name] = 0;
    }
    data.counts[name] += 1;
    const ip = await getClientIp();
    data.events.unshift({
      name,
      details: details || '',
      ip,
      at: new Date().toISOString()
    });
    data.events = data.events.slice(0, 40);
    saveAnalyticsData(data);
  }).catch(() => {
    // ignore analytics queue failures
  });

  return analyticsWriteQueue;
}

function initAnalyticsTracking() {
  trackEvent('site_entry');
  const currentPage = getCurrentPageName();
  if (currentPage === 'dashboard.html' || currentPage === 'dashboard') {
    trackEvent('dashboard_visit');
  }
  if (currentPage === 'portfolio.html' || currentPage === 'portfolio') {
    trackEvent('portfolio_visit');
  }

  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = (anchor.getAttribute('href') || '').toLowerCase();
    if (href.includes('lastcven.pdf')) trackEvent('cv_click');
    if (href.includes('github.com')) trackEvent('github_click');
    if (href.includes('linkedin.com')) trackEvent('linkedin_click');
  });
}

/* ---- Page Loader ---- */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('loaded'), 300));
  setTimeout(() => loader.classList.add('loaded'), 3000);
}

/* ---- Theme Toggle ---- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.classList.remove('theme-dark');
  } else {
    document.documentElement.classList.add('theme-dark');
  }
  const isDarkInitial = document.documentElement.classList.contains('theme-dark');
  toggle.setAttribute('aria-label', isDarkInitial ? t('ui.switchToLightMode') : t('ui.switchToDarkMode'));
  toggle.setAttribute('title', isDarkInitial ? t('ui.switchToLightMode') : t('ui.switchToDarkMode'));
  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-dark');
    const isDark = document.documentElement.classList.contains('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggle.setAttribute('aria-label', isDark ? t('ui.switchToLightMode') : t('ui.switchToDarkMode'));
    toggle.setAttribute('title', isDark ? t('ui.switchToLightMode') : t('ui.switchToDarkMode'));
  });
}

/* ---- Navbar scroll effect & active link ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const currentPage = getCurrentPageName();
  const isHome = currentPage === '' || currentPage === 'index.html';

  document.querySelectorAll('.nav-links .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (!isHome) navbar.classList.add('scrolled');

  const onScroll = () => {
    if (isHome) navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  if (isHome) window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navbar || !navLinks) return;
  hamburger.setAttribute('aria-label', t('ui.openMenu'));

  const toggle = () => {
    const isOpen = navbar.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? t('ui.closeMenu') : t('ui.openMenu'));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navbar.classList.contains('nav-open')) toggle();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navbar.classList.contains('nav-open')) toggle();
  });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
}

/* ---- Footer Year ---- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Back to Top ---- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.setAttribute('aria-label', t('common.backToTop'));
  const toggleBtn = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- Phone Reveal ---- */
function initPhoneReveal() {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  if (!phoneLinks.length) return;

  phoneLinks.forEach(link => {
    if (link.dataset.phoneRevealReady === 'true') return;

    const rawHref = link.getAttribute('href') || '';
    const phoneRaw = rawHref.replace(/^tel:/i, '').trim();
    const visibleText = (link.textContent || '').trim();

    // Only mask links that visibly show a phone number.
    if (!/\d/.test(visibleText) || !/\d/.test(phoneRaw)) return;

    link.dataset.phoneRevealReady = 'true';
    link.dataset.phoneOriginalText = visibleText;
    link.dataset.phoneOriginalHref = rawHref;

    const digitsOnly = phoneRaw.replace(/\D/g, '');
    const keepSuffix = digitsOnly.slice(-3);
    const maskedText = visibleText
      .replace(/\d/g, '*')
      .replace(/\*{1,3}\s*$/, keepSuffix);

    link.textContent = maskedText;
    link.setAttribute('href', '#');
    link.setAttribute('title', t('common.revealPhone'));
    link.setAttribute('aria-label', t('common.revealPhone'));

    link.addEventListener('click', event => {
      const isRevealed = link.dataset.phoneRevealed === 'true';
      if (isRevealed) return;

      event.preventDefault();
      link.dataset.phoneRevealed = 'true';
      link.textContent = link.dataset.phoneOriginalText || visibleText;
      link.setAttribute('href', link.dataset.phoneOriginalHref || rawHref);
      link.setAttribute('title', t('common.callNow'));
      link.setAttribute('aria-label', t('common.phoneRevealed'));
    });
  });
}

/* ---- Particles ---- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animId;
  let particleCount = 60;
  const MAX_DIST = 140;

  function resize() {
    const section = canvas.closest('.hero');
    width = canvas.width = section ? section.offsetWidth : window.innerWidth;
    height = canvas.height = section ? section.offsetHeight : window.innerHeight;
    particleCount = width < 768 ? 40 : 60;
  }
  function create() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
        r: Math.random() * 2 + 1
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.classList.contains('theme-dark');
    const color = isDark ? '96,165,250' : '59,130,246';
    const dotAlpha = isDark ? .5 : .65;
    const lineAlpha = isDark ? .2 : .3;
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${dotAlpha})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color},${lineAlpha * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = .7; ctx.stroke();
        }
      }
    });
    animId = requestAnimationFrame(draw);
  }

  resize(); create(); draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); create(); draw(); });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(animId); }, { once: true });
}

/* ---- Typing Effect ---- */
function initTypingEffect() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const roles = i18nValue('home.roles') || [];
  if (!Array.isArray(roles) || !roles.length) return;
  let roleIdx = 0, charIdx = 0, deleting = false, pause = 0;

  function type() {
    const current = roles[roleIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; pause = 400; }
      else pause = 30;
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) { deleting = true; pause = 1800; }
      else pause = 80;
    }
    setTimeout(type, pause);
  }
  type();
}

/* ---- Counter Animation ---- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}
function animateCounter(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500, start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initAutoProjectsCounter() {
  const projectsCounter = document.querySelector('.stats .stat-item:first-child .stat-number');
  const technologiesCounter = document.querySelector('.stats .stat-item:nth-child(2) .stat-number');
  const yearsCounter = document.querySelector('.stats .stat-item:nth-child(3) .stat-number');
  if (!projectsCounter && !technologiesCounter && !yearsCounter) return;

  fetch('assets/data/projects.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load projects data');
      return response.json();
    })
    .then(projects => {
      const data = Array.isArray(projects) ? projects : [];
      const totalProjects = data.length;
      const uniqueTags = new Set();
      const years = [];

      data.forEach(project => {
        const tags = Array.isArray(project?.tags) ? project.tags : [];
        tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            uniqueTags.add(tag.trim().toLowerCase());
          } else if (tag && typeof tag === 'object') {
            // Bug 4 fix: treat each {en,pt} object as one technology (use 'en' as canonical key)
            const key = typeof tag.en === 'string' && tag.en.trim()
              ? tag.en.trim().toLowerCase()
              : (typeof tag.pt === 'string' ? tag.pt.trim().toLowerCase() : null);
            if (key) uniqueTags.add(key);
          }
        });

        const y = Number(project?.year);
        if (Number.isFinite(y)) years.push(y);
      });

      // Bug 3 fix: derive years of experience from a fixed professional start date
      // (Critical Software, Feb 2026) rather than the oldest project year.
      const EXP_START_YEAR = 2026;
      const EXP_START_MONTH = 2; // February (1-based)
      const now = new Date();
      const currentYear = now.getFullYear();
      const monthsElapsed = (currentYear - EXP_START_YEAR) * 12 + (now.getMonth() + 1 - EXP_START_MONTH);
      const yearsExperience = Math.max(1, Math.ceil(monthsElapsed / 12));

      if (projectsCounter) {
        projectsCounter.dataset.count = String(totalProjects);
        projectsCounter.textContent = '0';
        delete projectsCounter.dataset.counted;
        animateCounter(projectsCounter);
      }

      if (technologiesCounter) {
        technologiesCounter.dataset.count = String(uniqueTags.size);
        technologiesCounter.textContent = '0';
        delete technologiesCounter.dataset.counted;
        animateCounter(technologiesCounter);
      }

      if (yearsCounter) {
        yearsCounter.dataset.count = String(yearsExperience);
        yearsCounter.textContent = '0';
        delete yearsCounter.dataset.counted;
        animateCounter(yearsCounter);
      }
    })
    .catch(() => {
      // Keep existing fallback value from HTML when data cannot be loaded.
    });
}

/* ---- Card Tilt ---- */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  let rafId = 0;
  let pendingEvent = null;
  let activeCard = null;

  const updateTilt = () => {
    rafId = 0;
    if (!pendingEvent) return;
    const e = pendingEvent;
    const card = e.target.closest('.project-card');
    if (!card) return;
    if (activeCard && activeCard !== card) activeCard.style.transform = '';
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    activeCard = card;
  };

  document.addEventListener('mousemove', e => {
    pendingEvent = e;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });
  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.project-card');
    if (card) card.style.transform = '';
    if (activeCard === card) activeCard = null;
  }, true);
}

/* ---- Projects Page ---- */
function initProjectsPage() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  const searchInput = document.getElementById('project-search');
  const filtersContainer = document.getElementById('project-filters');
  const resultsCount = document.getElementById('results-count');
  let activeTag = 'All';

  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProjectsData = data;
      renderFilters(data, filtersContainer);
      renderProjects(data, grid);
      updateCount(data.length, resultsCount);
    })
    .catch(() => {
      grid.innerHTML = `<div class="no-results"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#triangle-exclamation"></use></svg><p>${esc(t('projects.loadError'))}</p></div>`;
    });

  if (searchInput) searchInput.addEventListener('input', () => applyFilters(allProjectsData, activeTag, searchInput.value, grid, resultsCount));
  if (filtersContainer) filtersContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;
    activeTag = btn.dataset.tag;
    filtersContainer.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters(allProjectsData, activeTag, searchInput ? searchInput.value : '', grid, resultsCount);
  });
}
function initFeaturedProjects() {
  const grid = document.getElementById('featured-projects');
  if (!grid) return;
  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProjectsData = data;
      renderProjects(data.slice(0, 3), grid);
      applyTranslations();
    })
    .catch(() => { grid.innerHTML = `<p class="text-muted-center">${esc(t('projects.featuredLoadError'))}</p>`; });
}

function getLocalizedProjectText(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const lang = getCurrentLanguage();
    const localized = value[lang];
    if (typeof localized === 'string') return localized;
    if (typeof value.en === 'string') return value.en;
    if (typeof value.pt === 'string') return value.pt;
    return '';
  }
  return typeof value === 'string' ? value : '';
}

function getLocalizedProjectTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(tag => getLocalizedProjectText(tag))
    .filter(Boolean);
}

/* ---- Render Helpers ---- */
function renderFilters(projects, container) {
  if (!container) return;
  const tags = new Set();
  projects.forEach(p => getLocalizedProjectTags(p.tags).forEach(tag => tags.add(tag)));
  let html = `<button class="filter-tag active" data-tag="All">${esc(t('projects.all'))}</button>`;
  Array.from(tags).sort().forEach(tag => { html += `<button class="filter-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`; });
  container.innerHTML = html;
}

function applyFilters(projects, tag, query, grid, countEl) {
  const q = query.toLowerCase().trim();
  const filtered = projects.filter(p => {
    const title = getLocalizedProjectText(p.title).toLowerCase();
    const description = getLocalizedProjectText(p.description).toLowerCase();
    const localizedTags = getLocalizedProjectTags(p.tags);
    const matchTag = tag === 'All' || localizedTags.includes(tag);
    const matchQ = !q || title.includes(q) || description.includes(q);
    return matchTag && matchQ;
  });
  renderProjects(filtered, grid);
  updateCount(filtered.length, countEl);
}

function renderProjects(projects, grid) {
  if (!projects.length) {
    grid.innerHTML = `<div class="no-results"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#folder-open"></use></svg><p>${esc(t('projects.noResults'))}</p></div>`;
    return;
  }
  grid.innerHTML = projects.map(p => {
    const projectTitle = getLocalizedProjectText(p.title);
    const projectDescription = getLocalizedProjectText(p.description);
    const projectTags = getLocalizedProjectTags(p.tags);
    const openDetailsLabel = `${t('projects.openDetailsAriaPrefix')} ${projectTitle}`;
    const imageAlt = `${t('projects.imageAltPrefix')} ${projectTitle}`;
    return `
    <article class="project-card" data-project-id="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(openDetailsLabel)}">
      <div class="project-card-img-wrapper">
        <img src="${esc(p.image)}" alt="${esc(imageAlt)}" class="project-card-img" loading="lazy">
        <div class="project-card-overlay">
          ${p.year ? `<span class="project-card-year">${esc(String(p.year))}</span>` : ''}
        </div>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${esc(projectTitle)}</h3>
        <p class="project-card-desc">${esc(projectDescription)}</p>
        <div class="project-card-tags">${projectTags.map(tag => `<span class="project-card-tag">${esc(tag)}</span>`).join('')}</div>
        <div class="project-card-links">
          ${p.links.github && p.links.github !== '#' ? `<a href="${esc(p.links.github)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#github"></use></svg> ${esc(t('projects.github'))}</a>` : ''}
          ${p.links.demo && p.links.demo !== '#' ? `<a href="${esc(p.links.demo)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#arrow-up-right-from-square"></use></svg> ${esc(t('projects.demo'))}</a>` : ''}
        </div>
      </div>
    </article>
  `;
  }).join('');
  grid.querySelectorAll('.project-card-img').forEach(img => {
    img.addEventListener('error', () => img.classList.add('img-error'), { once: true });
  });
  grid.querySelectorAll('.project-card-link').forEach(link => {
    link.addEventListener('click', event => event.stopPropagation());
  });
  grid.querySelectorAll('.project-card').forEach(card => {
    const onOpen = e => {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      openProjectModal(card.dataset.projectId);
    };
    card.addEventListener('click', onOpen);
    card.addEventListener('keydown', onOpen);
  });
}

function updateCount(count, el) {
  if (!el) return;
  const unit = count === 1 ? t('projects.foundSingular') : t('projects.foundPlural');
  el.textContent = `${count} ${unit} ${t('projects.foundSuffix')}`;
}

/* ---- Project Modal ---- */

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  const overlay = document.getElementById('modal-overlay');
  if (!modal || !closeBtn || !overlay) return;

  let lastFocusedElement = null;

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
      return;
    }
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  modal.__setLastFocusedElement = el => { lastFocusedElement = el; };
}

function openProjectModal(projectId) {
  const project = allProjectsData.find(p => p.id === projectId);
  const modal = document.getElementById('project-modal');
  if (!project || !modal) return;

  const img = document.getElementById('modal-image');
  const projectTitle = getLocalizedProjectText(project.title);
  const projectDescription = getLocalizedProjectText(project.description);
  const localizedTags = getLocalizedProjectTags(project.tags);
  if (img) { img.src = project.image; img.alt = `${t('projects.imageAltPrefix')} ${projectTitle}`; }
  document.getElementById('modal-title').textContent = projectTitle;
  document.getElementById('modal-description').textContent = projectDescription;
  document.getElementById('modal-year').textContent = project.year || '';
  document.getElementById('modal-tags').innerHTML = localizedTags.map(tag => `<span>${esc(tag)}</span>`).join('');
  document.getElementById('modal-links').innerHTML = [
    project.links.github && project.links.github !== '#' && `<a href="${esc(project.links.github)}" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#github"></use></svg> ${esc(t('projects.github'))}</a>`,
    project.links.demo && project.links.demo !== '#' && `<a href="${esc(project.links.demo)}" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#arrow-up-right-from-square"></use></svg> ${esc(t('projects.demo'))}</a>`
  ].filter(Boolean).join('');

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (typeof modal.__setLastFocusedElement === 'function') {
    modal.__setLastFocusedElement(document.activeElement);
  }
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) window.setTimeout(() => closeBtn.focus(), 0);
}

/* ---- Contact Form ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');

  form.addEventListener('submit', e => {
    if (alertSuccess) alertSuccess.style.display = 'none';
    if (alertError) alertError.style.display = 'none';

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));

    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim() || !input.checkValidity()) {
        input.closest('.form-group').classList.add('invalid');
        valid = false;
      }
    });

    if (!valid) {
      e.preventDefault();
      const first = form.querySelector('.form-group.invalid .form-input');
      if (first) first.focus();
      return;
    }

    trackEvent('form_submit');

    const action = form.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID') || action === '#') {
      e.preventDefault();
      if (alertError) {
        alertError.textContent = t('contact.formNotConfigured');
        alertError.style.display = 'block';
        alertError.focus();
      }
    }
  });
}

/* ---- Login Form ---- */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  if (form.dataset.auth === 'supabase-otp') return;

  const alertSuccess = document.getElementById('login-alert-success');
  const alertError   = document.getElementById('login-alert-error');
  const emailInput   = document.getElementById('login-email');
  const passInput    = document.getElementById('login-password');

  function showAlert(el) { if (!el) return; el.classList.add('show'); el.setAttribute('aria-hidden', 'false'); el.focus(); }
  function hideAlert(el) { if (!el) return; el.classList.remove('show'); el.setAttribute('aria-hidden', 'true'); }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert(alertSuccess);
    hideAlert(alertError);
    form.querySelectorAll('.form-group').forEach(function (g) { g.classList.remove('invalid'); });

    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      if (!input.value.trim() || !input.checkValidity()) {
        input.closest('.form-group').classList.add('invalid');
        valid = false;
      }
    });
    if (!valid) {
      var first = form.querySelector('.form-group.invalid .form-input');
      if (first) first.focus();
      return;
    }

    var email    = emailInput.value.trim().toLowerCase();
    var password = passInput.value;
    var sb = window.__supabase;
    if (!sb) { showAlert(alertError); return; }

    var result = await sb.auth.signInWithPassword({ email: email, password: password });

    if (!result.error) {
      trackEvent('login_success', email);
      showAlert(alertSuccess);
      setTimeout(function () { window.location.href = '/dashboard'; }, 900);
      return;
    }

    showAlert(alertError);
    if (emailInput) emailInput.closest('.form-group').classList.add('invalid');
    if (passInput)  passInput.closest('.form-group').classList.add('invalid');
  });
}

/* ---- Portfolio Slider ---- */
function initPortfolioSlider() {
  const slider = document.getElementById('portfolio-slider');
  if (!slider) return;

  const track = slider.querySelector('.portfolio-track');
  const slides = Array.from(slider.querySelectorAll('.portfolio-slide'));
  const prevBtn = document.getElementById('portfolio-prev');
  const nextBtn = document.getElementById('portfolio-next');
  const dots = Array.from(slider.querySelectorAll('.portfolio-dot'));
  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  let current = 0;

  const render = () => {
    track.style.transform = `translateX(-${current * 100}%)`;
    slider.setAttribute('data-current-index', String(current));
    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    render();
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    render();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      current = i;
      render();
    });
  });

  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const event = new CustomEvent('openPortfolioLightbox', { detail: { index: i } });
      document.dispatchEvent(event);
    });
  });

  render();
}

function initPortfolioLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  if (!lightbox) return;

  const image = document.getElementById('portfolio-lightbox-image');
  const caption = document.getElementById('portfolio-lightbox-caption');
  const closeBtn = document.getElementById('portfolio-lightbox-close');
  const prevBtn = document.getElementById('portfolio-lightbox-prev');
  const nextBtn = document.getElementById('portfolio-lightbox-next');
  const zoomInBtn = document.getElementById('portfolio-lightbox-zoom-in');
  const zoomOutBtn = document.getElementById('portfolio-lightbox-zoom-out');
  const fullscreenBtn = document.getElementById('portfolio-lightbox-fullscreen');
  const backdrop = lightbox.querySelector('.portfolio-lightbox-backdrop');
  const images = Array.from(document.querySelectorAll('#portfolio-slider .portfolio-slide img'));
  if (!image || !closeBtn || !prevBtn || !nextBtn || !zoomInBtn || !zoomOutBtn || !fullscreenBtn || !images.length) return;

  let current = 0;
  let zoom = 1;
  let touchStartX = 0;

  const applyZoom = () => {
    image.style.transform = `scale(${zoom})`;
  };

  const render = () => {
    const source = images[current];
    image.src = source.src;
    image.alt = source.alt || 'Portfolio image';
    if (caption) {
      const slideCaption = source.closest('.portfolio-slide').querySelector('.portfolio-caption');
      caption.textContent = slideCaption ? slideCaption.textContent : '';
    }
    zoom = 1;
    applyZoom();
  };

  const open = index => {
    current = index;
    render();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const next = () => {
    current = (current + 1) % images.length;
    render();
  };

  const prev = () => {
    current = (current - 1 + images.length) % images.length;
    render();
  };

  document.addEventListener('openPortfolioLightbox', e => {
    open(Number(e.detail.index) || 0);
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  if (backdrop) backdrop.addEventListener('click', close);

  zoomInBtn.addEventListener('click', () => {
    zoom = Math.min(zoom + 0.2, 3);
    applyZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    zoom = Math.max(zoom - 0.2, 1);
    applyZoom();
  });

  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await lightbox.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      // Ignore unsupported fullscreen API failures
    }
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === '+' || e.key === '=') {
      zoom = Math.min(zoom + 0.2, 3);
      applyZoom();
    }
    if (e.key === '-') {
      zoom = Math.max(zoom - 0.2, 1);
      applyZoom();
    }
    if (e.key.toLowerCase() === 'f') {
      fullscreenBtn.click();
    }
  });

  image.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  image.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  }, { passive: true });
}

function initDashboard() {
  const root = document.getElementById('dashboard-page');
  if (!root) return;

  const auth = getStoredAuthSession() || {};
  const analytics = getAnalyticsData();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('dashboard-last-login', auth.loggedInAt ? new Date(auth.loggedInAt).toLocaleString() : '-');
  setText('site-entries', String(analytics.counts.site_entry || 0));
  setText('dashboard-visits', String(analytics.counts.dashboard_visit || 0));
  setText('portfolio-visits', String(analytics.counts.portfolio_visit || 0));
  setText('cv-clicks', String(analytics.counts.cv_click || 0));
  setText('form-submits', String(analytics.counts.form_submit || 0));
  setText('github-clicks', String(analytics.counts.github_click || 0));
  setText('linkedin-clicks', String(analytics.counts.linkedin_click || 0));
  setText('login-events', String(analytics.counts.login_success || 0));

  const eventsList = document.getElementById('dashboard-events');
  if (eventsList) {
    const events = analytics.events.slice(0, 8);
    if (!events.length) {
      eventsList.innerHTML = `<li>${esc(t('labels.noEvents'))}</li>`;
    } else {
      eventsList.innerHTML = events.map(evt => (
        `<li><strong>${esc(evt.name)}</strong> - ${esc(new Date(evt.at).toLocaleString())} - ${esc(t('labels.ip'))}: ${esc(evt.ip || 'unknown')}</li>`
      )).join('');
    }
  }
}

/* ---- Card Glow (cursor-following radial glow) ---- */
function initCardGlow() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  let rafId = 0;
  let pendingEvent = null;
  let activeCard = null;

  const updateGlow = () => {
    rafId = 0;
    if (!pendingEvent) return;
    const e = pendingEvent;
    const card = e.target.closest('.service-card, .project-card, .contact-info-item, .stat-item');
    if (!card) return;
    if (activeCard && activeCard !== card) activeCard.classList.remove('has-glow');
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--glow-x', x + 'px');
    card.style.setProperty('--glow-y', y + 'px');
    if (!card.classList.contains('has-glow')) card.classList.add('has-glow');
    activeCard = card;
  };

  document.addEventListener('mousemove', e => {
    pendingEvent = e;
    if (!rafId) rafId = requestAnimationFrame(updateGlow);
  });
  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.service-card, .project-card, .contact-info-item, .stat-item');
    if (card) card.classList.remove('has-glow');
    if (activeCard === card) activeCard = null;
  }, true);
}

/* ---- Hero Parallax on Scroll ---- */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const text = hero.querySelector('.hero-text');
  const avatar = hero.querySelector('.hero-avatar-wrapper');
  const grid = hero.querySelector('.hero-grid-pattern');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const heroH = hero.offsetHeight;
      if (y < heroH) {
        const ratio = y / heroH;
        if (text) text.style.transform = `translateY(${ratio * 60}px)`;
        if (avatar) avatar.style.transform = `translateY(${ratio * 40}px) scale(${1 - ratio * 0.1})`;
        if (grid) grid.style.transform = `translateY(${ratio * 25}px)`;
      } else {
        if (text) text.style.transform = '';
        if (avatar) avatar.style.transform = '';
        if (grid) grid.style.transform = '';
      }
      ticking = false;
    });
  }, { passive: true });

  if (window.scrollY === 0) {
    if (text) text.style.transform = '';
    if (avatar) avatar.style.transform = '';
    if (grid) grid.style.transform = '';
  }
}

/* ---- Smooth Stagger for grids ---- */
function initSmoothStagger() {
  const grids = document.querySelectorAll('.services-grid, .tech-strip, .projects-grid, .skills-grid, .contact-info-list');
  if (!grids.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        if (child.dataset.staggered === 'true') return;
        const opacity = Number(window.getComputedStyle(child).opacity || 0);
        if (opacity > 0.95) {
          child.dataset.staggered = 'true';
          return;
        }
        child.style.opacity = '0';
        child.style.transform = 'translateY(25px)';
        setTimeout(() => {
          child.style.transition = 'opacity .6s cubic-bezier(.23,1,.32,1), transform .6s cubic-bezier(.23,1,.32,1)';
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
          child.dataset.staggered = 'true';
        }, i * 100);
      });
    });
  }, { threshold: 0.1 });
  grids.forEach(g => observer.observe(g));
}

/* ---- Escape HTML ---- */
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
