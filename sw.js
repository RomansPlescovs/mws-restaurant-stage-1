const staticCacheName = 'restaurants-v1',
    filesToCache = [
        '/index.html',
        '/restaurant.html',
        '/js/restaurant_list.js',
        '/js/restaurant_details.js',
        '/sw.js',
        '/css/styles.css',
        '/img/1.webp',
        '/img/2.webp',
        '/img/3.webp',
        '/img/4.webp',
        '/img/5.webp',
        '/img/6.webp',
        '/img/7.webp',
        '/img/8.webp',
        '/img/9.webp',
        '/img/10.webp'
];


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll(filesToCache); 
        })
    );
    console.log("cached files on install");
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('restaurants-') && cacheName !== staticCacheName;
                }).map(function(cacheName) {
                    console.log("deleted cache: ", cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(staticCacheName).then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    const requestUrl = new URL(event.request.url);
                    if (!["POST", "PUT"].includes(event.request.method) && requestUrl.pathname !== "/") {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            });
        })
    );
});
