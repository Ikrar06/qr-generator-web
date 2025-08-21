// Service Worker for QR Generator Pro
// Provides offline functionality, caching, and performance optimizations

const CACHE_NAME = 'qr-generator-v1.0.0';
const STATIC_CACHE_NAME = 'qr-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'qr-dynamic-v1.0.0';

// Assets to cache immediately when service worker installs
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html', // Create this as a fallback page
  '/_next/static/css/', // Next.js CSS files (will be cached dynamically)
  '/_next/static/chunks/', // Next.js JS chunks (will be cached dynamically)
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/health'
];

// Files that should never be cached
const NEVER_CACHE = [
  '/api/generate-qr', // QR generation should always be fresh
  '/generated-qr/',   // User generated files
  '/downloads/',      // User downloads
  '/analytics',       // Analytics data
  'chrome-extension://',
  'moz-extension://'
];

// Network-first resources (always try network, fallback to cache)
const NETWORK_FIRST = [
  '/api/',
  '/docs'
];

// Cache-first resources (use cache if available, otherwise network)
const CACHE_FIRST = [
  '/icons/',
  '/images/',
  '/_next/static/',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        
        // Cache static assets with error handling
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await staticCache.add(asset);
            console.log(`Cached: ${asset}`);
          } catch (error) {
            console.warn(`Failed to cache: ${asset}`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('Service Worker: Static assets cached');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Install failed', error);
      }
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('qr-') && 
          name !== CACHE_NAME && 
          name !== STATIC_CACHE_NAME && 
          name !== DYNAMIC_CACHE_NAME
        );
        
        await Promise.all(
          oldCaches.map(cacheName => {
            console.log(`Service Worker: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        // Take control of all clients
        await clients.claim();
        console.log('Service Worker: Activated and claimed clients');
      } catch (error) {
        console.error('Service Worker: Activation failed', error);
      }
    })()
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip requests that should never be cached
  if (NEVER_CACHE.some(pattern => request.url.includes(pattern))) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle different caching strategies based on request type
  if (NETWORK_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(networkFirst(request));
  } else if (CACHE_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses for future offline use
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(console.warn);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log(`Network failed for ${request.url}, trying cache...`);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for documents
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy: Use cache if available, otherwise network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Optional: Update cache in background for next time
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(console.warn);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn(`Failed to fetch ${request.url}:`, error);
    throw error;
  }
}

// Stale-while-revalidate strategy: Return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Fetch from network in background to update cache
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME);
      cache.then(c => c.put(request, response.clone()).catch(console.warn));
    }
    return response;
  }).catch(console.warn);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  try {
    return await networkPromise;
  } catch (error) {
    // Return offline fallback for documents
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    throw error;
  }
}

// Update cache in background (fire and forget)
function updateCacheInBackground(request) {
  fetch(request).then(response => {
    if (response.ok) {
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        cache.put(request, response).catch(console.warn);
      });
    }
  }).catch(console.warn);
}

// Handle background sync for offline QR generation (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'qr-generation') {
    console.log('Background sync: QR generation');
    event.waitUntil(processOfflineQRRequests());
  }
});

// Process offline QR generation requests
async function processOfflineQRRequests() {
  // This would handle queued QR generation requests when back online
  // Implementation depends on how you store offline requests
  try {
    // Get pending requests from IndexedDB or localStorage
    // Process each request
    // Clear processed requests
    console.log('Processing offline QR requests...');
  } catch (error) {
    console.error('Failed to process offline requests:', error);
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/'
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/action-open.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/action-close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('QR Generator Pro', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Cache management utilities
async function clearOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('qr-') && 
    name !== CACHE_NAME && 
    name !== STATIC_CACHE_NAME && 
    name !== DYNAMIC_CACHE_NAME
  );
  
  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// Periodic cleanup (called from main thread)
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(clearOldCaches());
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        const cacheInfo = {
          caches: cacheNames,
          version: CACHE_NAME
        };
        event.ports[0].postMessage(cacheInfo);
      })()
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Script loaded');