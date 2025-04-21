self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("pwa-cache").then((cache) => {
      return cache.addAll([
        "/",
        "./public/index.html",
        "./public/home.html",
        "./public/signup.html",
        "./public/verification.html",
        "./public/css/output.css",
        "./public/css/input.css",
        "./public/js/index.js",
        "./public/js/addproduct.js",
        "./public/js/auth.js",
        "./public/js/modal.js",
        "./public/js/pos.js",
        "./public/js/signin.js",
        "./public/js/upload.js",
        "./public/images/1000073888.png",
        "./public/images/5100_3_05-Photoroom.png",
        "./public/images/illus-1.png",
        "./public/images/illus-2.png",
        "./public/images/human.png",
        "./public/images/Iphone-spinner-2.gif",
        "./public/images/logo.ico",
        "./public/images/logo.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
