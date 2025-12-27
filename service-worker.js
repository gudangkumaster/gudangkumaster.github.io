const CACHE_NAME = 'neobrutal-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './assets/images/icon.svg',
    './assets/css/style.css', // Assuming main css
    './assets/css/settings.css',
    './assets/css/pull-to-refresh.css',
    './assets/js/app.js',
    './assets/js/settings.js',
    './assets/js/bills.js',
    './assets/js/sound-manager.js',
    './assets/js/pull-to-refresh.js',
    './assets/js/views/HomeView.js',
    './assets/js/views/SettingsView.js',
    './assets/js/views/FooterNavView.js',
    './assets/js/views/ModalsView.js',
    // External resources (might need CORS handling or NetworkFirst)
    'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', event => {
    console.log('👷 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('👷 Service Worker: Caching Assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Event
self.addEventListener('activate', event => {
    console.log('👷 Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('👷 Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event (Network First, Fallback to Cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
