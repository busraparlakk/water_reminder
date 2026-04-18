// lib/scheduler.ts

import { WaterSettings, NotificationPayload } from '@/types'

// ─── Yardımcı: "HH:MM" → dakika cinsinden gün içi konum ────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─── Aktif dakika hesabı (uyanık olunan süre) ────────────────────────────────

export function getActiveMinutes(settings: WaterSettings): number {
  const wake = timeToMinutes(settings.wakeTime)
  const sleep = timeToMinutes(settings.sleepTime)

  // Gece yarısını geçen uyku düzeni (örn: 23:00 → 07:00)
  if (sleep <= wake) {
    return 24 * 60 - wake + sleep
  }
  return sleep - wake
}

// ─── Optimum bildirim aralığını hesapla ─────────────────────────────────────
// Hedefe ulaşmak için kaç içiş gerekli → aktif süreye böl

export function calcIntervalMinutes(settings: WaterSettings): number {
  const drinksNeeded = Math.ceil(
    settings.dailyGoalMl / settings.amountPerDrinkMl
  )
  const activeMin = getActiveMinutes(settings)

  // İlk ve son 30 dakikayı tampon olarak bırak
  const usableMin = Math.max(activeMin - 60, 30)
  const interval = Math.floor(usableMin / drinksNeeded)

  // Min 20 dk, max 120 dk aralık
  return Math.min(Math.max(interval, 20), 120)
}

// ─── Günlük bildirim programını oluştur ──────────────────────────────────────

export function buildSchedule(settings: WaterSettings): NotificationPayload[] {
  const interval = calcIntervalMinutes(settings)
  const wake = timeToMinutes(settings.wakeTime)
  const sleep = timeToMinutes(settings.sleepTime)
  const activeMin = getActiveMinutes(settings)

  const schedule: NotificationPayload[] = []
  const today = new Date()
  today.setSeconds(0, 0)

  let cursor = wake + 30 // Uyanıştan 30 dk sonra ilk hatırlatıcı
  let index = 0

  while (true) {
    // Uyku saatinden 30 dk önce dur
    const minutesFromWake = cursor - wake < 0
      ? cursor - wake + 24 * 60
      : cursor - wake

    if (minutesFromWake >= activeMin - 30) break

    const scheduledDate = new Date(today)
    const absoluteMinutes = cursor % (24 * 60)
    scheduledDate.setHours(Math.floor(absoluteMinutes / 60))
    scheduledDate.setMinutes(absoluteMinutes % 60)

    // Geçmiş saatleri bugün için atla, yine de listeye ekle (UI'da göstermek için)
    const isFirstDrink = index === 0
    const isLastDrink =
      cursor + interval >= wake + activeMin - 30 ||
      cursor + interval >= sleep - 30

    schedule.push({
      id: `reminder-${index}`,
      title: isFirstDrink
        ? '☀️ Günaydın! Su içme vakti'
        : isLastDrink
        ? '🌙 Günün son su hatırlatıcısı'
        : '💧 Su içme vakti!',
      body: buildBody(index, settings, isLastDrink),
      scheduledAt: scheduledDate.toISOString(),
      type: isFirstDrink ? 'morning' : isLastDrink ? 'evening' : 'reminder',
    })

    cursor += interval
    index++
  }

  return schedule
}

// ─── Bildirim metni olu────────────────────────────────────────────────────────

function buildBody(
  index: number,
  settings: WaterSettings,
  isLast: boolean
): string {
  const messages = [
    `${settings.amountPerDrinkMl}ml su iç, hedefe bir adım daha yaklaş!`,
    `Bir bardak su seni bekliyor. Hedef: ${settings.dailyGoalMl}ml`,
    'Düzenli su içmek enerji verir. Hadi bir yudum!',
    'Vücudun su istiyor, sen de ver!',
    'Küçük adımlar büyük hedefler. Bir bardak daha!',
    'Sağlıklı kalmak için su iç!',
  ]

  if (isLast) {
    return `Günü kapatmadan önce ${settings.amountPerDrinkMl}ml daha iç!`
  }

  return messages[index % messages.length]
}

// ─── Bir sonraki bildirimi bul ────────────────────────────────────────────────

export function getNextReminder(
  schedule: NotificationPayload[]
): NotificationPayload | null {
  const now = new Date()
  return (
    schedule
      .filter((n) => new Date(n.scheduledAt) > now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )[0] ?? null
  )
}

// ─── Kaç dakika kaldı? ────────────────────────────────────────────────────────

export function minutesUntilNext(next: NotificationPayload): number {
  const diff = new Date(next.scheduledAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 60000))
}