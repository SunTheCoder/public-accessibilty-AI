const CACHE_NAME = 'transit-app-cache-v1';
const TILE_CACHE_NAME = 'map-tile-cache';
const MAX_CACHED_TILES = 1000;

// Cache map tiles and other assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle map tile requests
  if (url.href.includes('tile.openstreetmap.org')) {
    event.respondWith(
      cacheFirst({
        request,
        cacheName: TILE_CACHE_NAME,
        maxItems: MAX_CACHED_TILES
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    cacheFirst({
      request,
      cacheName: CACHE_NAME
    })
  );
});

async function cacheFirst({ request, cacheName, maxItems }) {
  const cache = await caches.open(cacheName);
  
  // Try cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // If not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Before caching new item, check and potentially clean cache
      if (maxItems) {
        const keys = await cache.keys();
        if (keys.length >= maxItems) {
          // Remove oldest items
          for (let i = 0; i < keys.length - maxItems + 1; i++) {
            await cache.delete(keys[i]);
          }
        }
      }
      
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If offline and not in cache, return error
    return new Response('Offline and not cached', { status: 504 });
  }
} 