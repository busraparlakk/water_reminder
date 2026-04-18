// public/sw.js

self.addEventListener('install', (event) => {
  console.log('[SW] Kuruldu')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Aktif')
  event.waitUntil(clients.claim())
})

// Push event — ileride backend push için hazır
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.id,
    })
  )
})

// Bildirime tıklanınca uygulamayı aç
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus()
        }
        return clients.openWindow('/')
      })
  )
})