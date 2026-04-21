'use strict';

const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const IMAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const IS_LOCAL_DEV = self.location.hostname === '127.0.0.1' || self.location.hostname === 'localhost';

const CANONICAL_DOCUMENT_PATHS = {
  '/index.html': '/',
  '/about.html': '/about',
  '/projects.html': '/projects',
  '/contact.html': '/contact',
  '/privacy.html': '/privacy',
  '/login.html': '/login',
  '/register.html': '/register',
  '/dashboard.html': '/dashboard',
  '/portfolio.html': '/portfolio',
  '/offline.html': '/offline'
};

const PUBLIC_DOCUMENT_URLS = IS_LOCAL_DEV
  ? [
      '/',
      '/index.html',
      '/about.html',
      '/projects.html',
      '/contact.html',
      '/privacy.html',
      '/login.html',
      '/register.html',
      '/offline.html'
    ]
  : [
      '/',
      '/about',
      '/projects',
      '/contact',
      '/privacy',
      '/login',
      '/register',
      '/offline'
    ];

const APP_SHELL_URLS = [
  ...PUBLIC_DOCUMENT_URLS,
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/js/components.js',
  '/assets/js/consent.js',
  '/assets/js/font-loader.js',
  '/assets/js/login.js',
  '/assets/js/register.js',
  '/assets/js/pwa.js',
  '/assets/js/offline.js',
  '/assets/data/i18n.json',
  '/assets/data/projects.json',
  '/assets/img/icons.svg',
  '/assets/img/foto.jpg',
  '/assets/img/icons/icon-192.png',
  '/assets/img/icons/icon-512.png',
  '/assets/img/icons/icon-192-maskable.png',
  '/assets/img/icons/icon-512-maskable.png',
  '/assets/img/icons/apple-touch-icon.png',
  '/manifest.webmanifest'
];

const BYPASS_HOSTS = new Set([
  'auth.joaomiguelrosa.com',
  'api64.ipify.org',
  'cloudflareinsights.com',
  'challenges.cloudflare.com'
]);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_SHELL_CACHE);
    await cache.addAll(APP_SHELL_URLS);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
        .map(key => caches.delete(key))
    );
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!/^https?:$/.test(url.protocol)) return;

  if (BYPASS_HOSTS.has(url.hostname)) {
    event.respondWith(fetch(request));
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) {
    event.respondWith(fetch(request));
    return;
  }

  const pathname = url.pathname;

  if (pathname.endsWith('/dashboard.html') || pathname.endsWith('/portfolio.html')) {
    event.respondWith(networkOnlyWithOfflineFallback(request));
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request, url));
    return;
  }

  if (pathname.startsWith('/assets/data/') && pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (pathname.startsWith('/assets/css/') || pathname.startsWith('/assets/js/')) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  if (pathname.startsWith('/assets/img/')) {
    event.respondWith(cacheFirstWithExpiry(request, RUNTIME_CACHE, IMAGE_TTL_MS));
    return;
  }

  if (pathname === '/manifest.webmanifest') {
    event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE));
  }
});

async function networkOnlyWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch (_) {
    const cache = await caches.open(APP_SHELL_CACHE);
    return (await cache.match(getOfflineCachePath())) || (await cache.match('/offline.html')) || Response.error();
  }
}

async function handleDocumentRequest(request, url) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const canonicalPath = getCanonicalPath(url.pathname);
  const networkUrl = canonicalPath === url.pathname ? url : new URL(url.href);

  if (canonicalPath !== url.pathname) {
    networkUrl.pathname = canonicalPath;
  }

  const networkRequest = canonicalPath === url.pathname ? request : new Request(networkUrl.toString(), request);
  const cacheCandidates = canonicalPath === url.pathname
    ? [request]
    : [request, new Request(networkUrl.toString(), request)];

  for (const candidate of cacheCandidates) {
    const cached = await cache.match(candidate);
    if (cached) {
      fetchAndStoreDocument(networkRequest, cache, cacheCandidates).catch(() => {});
      return cached;
    }
  }

  try {
    return await fetchAndStoreDocument(networkRequest, cache, cacheCandidates);
  } catch (_) {
    return (await cache.match(getOfflineCachePath())) || (await cache.match('/offline.html')) || Response.error();
  }
}

async function fetchAndStoreDocument(request, cache, cacheTargets) {
  const response = await fetch(request);
  if (response && response.ok) {
    await Promise.all(cacheTargets.map(target => cache.put(target, response.clone())));
  }
  return response;
}

function getCanonicalPath(pathname) {
  if (IS_LOCAL_DEV) return pathname;
  return CANONICAL_DOCUMENT_PATHS[pathname] || pathname;
}

function getOfflineCachePath() {
  return IS_LOCAL_DEV ? '/offline.html' : '/offline';
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(async () => {
      if (request.mode === 'navigate' || request.destination === 'document') {
        return (await cache.match('/offline.html')) || Response.error();
      }
      return undefined;
    });

  return cached || networkPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function cacheFirstWithExpiry(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    const storedAtHeader = cached.headers.get('sw-fetched-on');
    const storedAt = storedAtHeader ? Number(storedAtHeader) : 0;
    if (storedAt && Date.now() - storedAt < ttlMs) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const body = await response.blob();
      const wrapped = new Response(body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': response.headers.get('Content-Length') || String(body.size),
          'sw-fetched-on': String(Date.now())
        },
        status: response.status,
        statusText: response.statusText
      });
      cache.put(request, wrapped.clone());
      return wrapped;
    }
    return response;
  } catch (_) {
    if (cached) return cached;
    throw _;
  }
}