const CACHE='jcecd-address-lookup-v5-1-cache-proof';
const ASSETS=['./', './index.html', './v51-data-01.tsv', './v51-data-02.tsv', './v51-data-03.tsv', './v51-data-04.tsv', './v51-data-05.tsv', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url =>
        fetch(url, {cache:'reload'}).then(resp => {
          if (!resp.ok) throw new Error(url + ' ' + resp.status);
          return cache.put(url, resp.clone());
        })
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k === CACHE ? Promise.resolve() : caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first for HTML and TSV so GitHub updates win immediately.
  if (url.pathname.endsWith('.tsv') || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request, {cache:'no-store'});
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, fresh.clone());
        }
        return fresh;
      } catch (e) {
        return (await caches.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
