// Service worker mínimo: solo existe para que la app sea instalable como PWA
// (ver plan-web.md D2 y paso 1.7). No implementa caché ni soporte offline.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sin manejo propio: deja pasar todas las peticiones al comportamiento
  // normal del navegador.
});
