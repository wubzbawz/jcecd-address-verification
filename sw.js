const CACHE='jcecd-address-lookup-v4-cross-adjoining';
const ASSETS=['./','./index.html','./data-01.tsv','./data-02.tsv','./data-03.tsv','./data-04.tsv','./data-05.tsv','./data-06.tsv','./data-07.tsv','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); });
