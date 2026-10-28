const CACHE_NAME = "dalil-asaar-v2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // استخدام cache.add فردي أو التأكد من عدم فشل الكل لو ملف واحد علق
        return Promise.all(
          CORE.map(url => cache.add(url).catch(err => console.log('Failed to cache:', url, err)))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache =>
          cache.put(event.request, copy)
        );
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          response => response || caches.match("./index.html")
        )
      )
  );
});
