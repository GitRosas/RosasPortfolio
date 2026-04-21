'use strict';
(function () {
  document.querySelectorAll('link[data-defer-css]').forEach(link => {
    if (link.sheet) {
      link.media = 'all';
      return;
    }
    link.addEventListener('load', () => {
      link.media = 'all';
    }, { once: true });
  });
})();
