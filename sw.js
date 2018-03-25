const staticCacheName = 'restaurants-v1',
    filesToCache = [
        '/index.html',
        '/restaurant.html',
        '/data/restaurants.json',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/sw.js',
        '/css/styles.css',
        '/img/'
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
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
