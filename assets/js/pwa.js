'use strict';

(function () {
  const I18N_CACHE_KEY = 'portfolioI18nCache';
  const LANGUAGE_STORAGE_KEY = 'portfolioLang';

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'pt' ? 'pt' : 'en';
  }

  function t(path, fallback) {
    try {
      const raw = localStorage.getItem(I18N_CACHE_KEY);
      if (!raw) return fallback || path;
      const data = JSON.parse(raw);
      let ref = data && typeof data === 'object' ? data[getLanguage()] : null;
      for (const part of path.split('.')) {
        if (!ref || typeof ref !== 'object') return fallback || path;
        ref = ref[part];
      }
      return typeof ref === 'string' ? ref : (fallback || path);
    } catch (_) {
      return fallback || path;
    }
  }

  if (!('serviceWorker' in navigator)) return;
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(() => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              });
            }
          });
        });
      })
      .catch(error => {
        console.warn('SW registration failed:', error);
      });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtLoad) return;
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  function showUpdateToast(onAccept) {
    if (document.querySelector('.pwa-update-toast')) return;

    const toast = document.createElement('div');
    toast.className = 'pwa-update-toast';
    toast.setAttribute('role', 'alert');

    const text = document.createElement('span');
    text.textContent = t('pwa.updateAvailable', 'A new version is available.');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = t('pwa.reload', 'Reload');
    button.addEventListener('click', () => {
      onAccept();
      toast.remove();
    });

    toast.appendChild(text);
    toast.appendChild(button);
    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 30000);
  }
})();