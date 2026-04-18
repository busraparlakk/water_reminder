// lib/notifications.ts

import { NotificationPayload } from '@/types'
import { getSavedNotifications, saveNotifications } from './storage'

// ─── Tip tanımları ────────────────────────────────────────────────────────────

export type ToastType = 'info' | 'success' | 'warning'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number // ms, default 4000
}

// ─── Web Push: İzin iste ─────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') return true

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// ─── Service Worker: Kayıt ───────────────────────────────────────────────────

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator)) return null

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('[SW] Kayıt başarılı:', reg.scope)
    return reg
  } catch (err) {
    console.error('[SW] Kayıt hatası:', err)
    return null
  }
}

// ─── Web Push: Anlık bildirim gönder ─────────────────────────────────────────

export function sendWebNotification(payload: NotificationPayload): void {
  if (Notification.permission !== 'granted') return

  const notif = new Notification(payload.title, {
    body: payload.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.id,          // Aynı tag → öncekinin üzerine yazar
    requireInteraction: false,
  })

  notif.onclick = () => {
    window.focus()
    notif.close()
  }
}

// ─── Zamanlı bildirimler: setTimeout ile kur ─────────────────────────────────

const scheduledTimers: ReturnType<typeof setTimeout>[] = []

export function scheduleWebNotifications(
  notifications: NotificationPayload[]
): void {
  // Önce mevcut timer'ları temizle
  clearAllScheduledNotifications()

  const now = Date.now()

  notifications.forEach((notif) => {
    const delay = new Date(notif.scheduledAt).getTime() - now

    if (delay <= 0) return // Geçmiş zamanları atla

    const timer = setTimeout(() => {
      sendWebNotification(notif)
    }, delay)

    scheduledTimers.push(timer)
  })
}

export function clearAllScheduledNotifications(): void {
  scheduledTimers.forEach(clearTimeout)
  scheduledTimers.length = 0
}

// ─── Toast sistemi ────────────────────────────────────────────────────────────
// Global event-based toast — herhangi bir bileşenden tetiklenebilir

const TOAST_EVENT = 'wh:toast'

export function showToast(options: ToastOptions): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: options }))
}

export function onToast(
  callback: (options: ToastOptions) => void
): () => void {
  const handler = (e: Event) => {
    callback((e as CustomEvent<ToastOptions>).detail)
  }
  window.addEventListener(TOAST_EVENT, handler)
  return () => window.removeEventListener(TOAST_EVENT, handler)
}

// ─── Bildirim programını kaydet ve kur ───────────────────────────────────────

export async function setupDailyNotifications(
  notifications: NotificationPayload[]
): Promise<boolean> {
  const granted = await requestNotificationPermission()

  if (!granted) {
    showToast({
      message: 'Bildirim izni verilmedi. Ayarlardan açabilirsin.',
      type: 'warning',
    })
    return false
  }

  saveNotifications(notifications)
  scheduleWebNotifications(notifications)

  showToast({
    message: `${notifications.length} hatırlatıcı kuruldu! 💧`,
    type: 'success',
  })

  return true
}

// ─── Sayfa yüklenince mevcut bildirimleri yeniden kur ────────────────────────

export function restoreScheduledNotifications(): void {
  const saved = getSavedNotifications()
  if (saved.length === 0) return
  scheduleWebNotifications(saved)
}