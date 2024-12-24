const CACHE_NAME = 'weather-cache-1';
const MAIN_URLS = ['/', '/css/styles.css', '/src/main.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return fetch('/json/icons.json')
        .then(response => response.json())
        .then(icons => {
          const iconURLs = icons.map(icon => icon.src);
          const allURLs = MAIN_URLS.concat(iconURLs);
          return cache.addAll(allURLs);
        });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchResponse => {
            // If the response is successful, cache it
            if (!fetchResponse.ok) {
              return fetchResponse; // Don't cache non-OK responses
            }

            // Clone the response to cache it (since the original response can only be used once)
            const cachedResponse = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              // Cache only successful responses
              if (fetchResponse.ok) {
                cache.put(event.request, cachedResponse);
              }
            });

            return fetchResponse; // Return the fetched response
          })
          .catch(error => {
            // Handle fetch errors (e.g., network issues)
            console.error('Fetch failed, and no cached response available', error);
          })
      );
    })
  );
});
