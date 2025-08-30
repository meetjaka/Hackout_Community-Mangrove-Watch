const CACHE_NAME = 'mangrove-watch-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/icons/logo-192x192.png',
  '/icons/logo-512x512.png'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - handle offline functionality
self.addEventListener('fetch', event => {
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Cache successful GET requests
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              
              // If it's a GET request, return offline page
              if (event.request.method === 'GET') {
                return caches.match(OFFLINE_URL);
              }
              
              throw new Error('No offline content available');
            });
        })
    );
  } else {
    // Handle static resources
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              // Cache successful GET requests
              if (event.request.method === 'GET') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            });
        })
    );
  }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const notification = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      data: notification.data
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData = event.notification.data;
  let urlToOpen = '/';

  if (notificationData) {
    switch (notificationData.type) {
      case 'NEW_REPORT':
        urlToOpen = `/reports/${notificationData.reportId}`;
        break;
      case 'REPORT_VERIFIED':
        urlToOpen = `/reports/${notificationData.reportId}`;
        break;
      case 'URGENT_ALERT':
        urlToOpen = `/alerts/${notificationData.alertId}`;
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline reports
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

// Function to sync offline reports
async function syncReports() {
  try {
    const db = await openDB('mangroveWatchDB', 1);
    const reports = await db.getAll('reports');
    
    for (const report of reports) {
      if (report.status === 'pending') {
        try {
          const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(report)
          });

          if (response.ok) {
            await db.delete('reports', report.id);
          }
        } catch (error) {
          console.error('Error syncing report:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
}
