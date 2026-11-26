/* Korteks: tarayıcı bildirimine tıklanınca ilgili sayfayı açar (FG-13).
   vite-plugin-pwa'nın ürettiği service worker bu dosyayı importScripts ile yükler. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const hedef = (event.notification.data && event.notification.data.hedef) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((pencereler) => {
      for (const p of pencereler) {
        if ('focus' in p) {
          p.navigate(hedef);
          return p.focus();
        }
      }
      return self.clients.openWindow(hedef);
    }),
  );
});
