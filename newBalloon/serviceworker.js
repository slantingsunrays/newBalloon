// ZIM Zapps PWA Service Worker to cache app files
// Please check to see all files have been listed with local links
// (Do not worry about icon files)

var cacheName = "zim_pwa_balloon-pop";
var filesToCache = [
  "./",
  "index.html",
  "libraries/1.3.2/createjs.js",
  "libraries/cat/04/zim.js",
  "libraries/game_2.4.js",
  "libraries/pizzazz_03.js",
  "libraries/socket.io.js",
  "libraries/zimserver_urls.js",
  "libraries/zimsocket_1.1.js",
  "assets/ball1.png",
  "assets/ball2.png",
  "assets/ball3.png",
  "assets/ball4.png",
  "assets/ball5.png",
  "assets/ball6.png",
  "assets/background.png",
  "assets/game-background.png",
  "assets/fireworks.wav",
  "assets/logo.png",
  "assets/Balloons.ttf",
];

/* Start the service worker and cache all of the app's content */
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
