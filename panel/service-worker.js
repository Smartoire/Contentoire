import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API requests
registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({
    cacheName: 'pages-cache',
    plugins: [
      {
        cacheDidUpdate: async ({ cacheName, request }) => {
          console.log(`Updated cache ${cacheName} for request:`, request.url);
        },
      },
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
  })
);

// Cache fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'fonts-cache',
  })
);

// Cache external scripts
registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'scripts-cache',
  })
);

// Cache external stylesheets
registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'styles-cache',
  })
);

// Cache API requests
registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Cache offline fallback page
registerRoute(
  ({ url }) => url.pathname === '/',
  new StaleWhileRevalidate({
    cacheName: 'offline-fallback',
  })
);

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith('pages-cache') &&
              !cacheName.startsWith('images-cache') &&
              !cacheName.startsWith('fonts-cache') &&
              !cacheName.startsWith('scripts-cache') &&
              !cacheName.startsWith('styles-cache') &&
              !cacheName.startsWith('api-cache') &&
              !cacheName.startsWith('offline-fallback')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      data: data.data,
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
