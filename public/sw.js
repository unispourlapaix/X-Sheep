/**
 * Service Worker pour X-Sheep
 * Cache pour fonctionnement offline
 */

const CACHE_NAME = 'x-sheep-v1.0.0';
// Détecter si on est en production (GitHub Pages) ou en local
const BASE_PATH = self.location.pathname.includes('/X-Sheep/') ? '/X-Sheep' : '';
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  // En dev, ne rien mettre en cache au départ
  if (isDev) {
    self.skipWaiting();
    return;
  }
  
  // En production, cacher les fichiers essentiels
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll([
          `${BASE_PATH}/`,
          `${BASE_PATH}/index.html`
        ]).catch(error => {
          console.warn('[SW] Erreur cache initial:', error);
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie: Network First, fallback sur Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers d'autres domaines
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cloner la réponse
        const responseToCache = response.clone();

        // Mettre en cache
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, essayer le cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('[SW] Chargement depuis cache:', event.request.url);
              return response;
            }
            
            // Retourner une page offline basique si rien dans le cache
            if (event.request.mode === 'navigate') {
              return caches.match('/X-Sheep/index.html');
            }
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
