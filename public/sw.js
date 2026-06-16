const CACHE = "pizzasteve-v2";
const STATIC = ["/", "/shop", "/about", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET requests entirely
  if (request.method !== "GET") return;

  // Network only for API calls
  if (url.hostname.includes("workers.dev") || url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" }
      }))
    );
    return;
  }

  // Cache first for images
  if (request.destination === "image") {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // Stale-while-revalidate for pages
  e.respondWith(
    caches.match(request).then(cached => {
      const fetched = fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});