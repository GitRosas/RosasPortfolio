'use strict';

(function () {
  const I18N_CACHE_KEY = 'portfolioI18nCache';
  const LANGUAGE_STORAGE_KEY = 'portfolioLang';

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'pt' ? 'pt' : 'en';
  }

  function getCachedTranslation(path) {
    try {
      const raw = localStorage.getItem(I18N_CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      let ref = data && typeof data === 'object' ? data[getLanguage()] : null;
      for (const part of path.split('.')) {
        if (!ref || typeof ref !== 'object') return null;
        ref = ref[part];
      }
      return typeof ref === 'string' ? ref : null;
    } catch (_) {
      return null;
    }
  }

  document.documentElement.lang = getLanguage();

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const value = getCachedTranslation(key);
    if (value) element.textContent = value;
  });

  document.getElementById('retry-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
})();