'use strict';
 
 const CACHE_VERSION = 'v1.0.2'; // BUMP — força clientes a actualizar
 const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
 const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
 const IMAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
 
 const APP_SHELL_URLS = [
   '/',
   '/index.html',
   '/about.html',
   '/projects.html',
   '/contact.html',
   '/privacy.html',
   '/login.html',
   '/register.html',
   '/offline.html',
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
     // addAll é all-or-nothing; usar add() individual evita falhar tudo se 1 URL der 
404
     await Promise.all(APP_SHELL_URLS.map(u => cache.add(u).catch(() => {})));
   })());
 });
 
 self.addEventListener('activate', event => {
   event.waitUntil((async () => {
     const keys = await caches.keys();
     await Promise.all(
       keys.filter(k => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE)
           .map(k => caches.delete(k))
     );
     await self.clients.claim();
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
 
   if (url.origin !== self.location.origin) {
     event.respondWith(fetch(request));
     return;
   }
 
   const pathname = url.pathname;
 
   // Páginas privadas: sempre rede, fallback offline
   if (pathname.endsWith('/dashboard.html') || pathname.endsWith('/portfolio.html')) {
     event.respondWith(networkOnlyWithOfflineFallback(request));
     return;
   }
 
   // Documentos: network-first, fallback cache, fallback offline.html
   if (request.mode === 'navigate' || request.destination === 'document') {
     event.respondWith(handleDocumentRequest(request));
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
     return (await cache.match('/offline.html')) || Response.error();
   }
 }
 
 async function handleDocumentRequest(request) {
   const cache = await caches.open(APP_SHELL_CACHE);
   try {
     const response = await fetch(request);
     if (response && response.ok) {
       cache.put(request, response.clone());
     }
     return response;
   } catch (_) {
     const cached = await cache.match(request);
     return cached || (await cache.match('/offline.html')) || Response.error();
   }
 }
 
 async function staleWhileRevalidate(request, cacheName) {
   const cache = await caches.open(cacheName);
   const cached = await cache.match(request);
   const networkPromise = fetch(request)
     .then(response => {
       if (response && response.ok) cache.put(request, response.clone());
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
   if (response && response.ok) cache.put(request, response.clone());
   return response;
 }
 
 async function cacheFirstWithExpiry(request, cacheName, ttlMs) {
   const cache = await caches.open(cacheName);
   const cached = await cache.match(request);
   if (cached) {
     const storedAt = Number(cached.headers.get('sw-fetched-on') || 0);
     if (storedAt && Date.now() - storedAt < ttlMs) return cached;
   }
   try {
     const response = await fetch(request);
     if (response && response.ok) {
       const body = await response.blob();
       const wrapped = new Response(body, {
         headers: {
           'Content-Type': response.headers.get('Content-Type') || 
'application/octet-stream',
           'Content-Length': response.headers.get('Content-Length') || 
String(body.size),
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