// app/layout.tsx
'use client'

import './globals.css'
import { useEffect } from 'react'
import { registerServiceWorker, restoreScheduledNotifications } from '@/lib/notifications'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Service Worker'ı kaydet
    registerServiceWorker()

    // Sayfa yenilenince bildirimleri geri yükle
    restoreScheduledNotifications()
  }, [])

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="description" content="Günlük su hedefine ulaş" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <title>Su Hatırlatıcı 💧</title>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}