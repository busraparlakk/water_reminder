// lib/storage.ts

import {
  User,
  WaterSettings,
  DailyProgress,
  ReminderLog,
  NotificationPayload,
  STORAGE_KEYS,
} from '@/types'

// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Kullanıcı işlemleri ─────────────────────────────────────────────────────

export function getAllUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS) ?? []
}

export function getUserByEmail(email: string): User | null {
  return getAllUsers().find((u) => u.email === email) ?? null
}

export function getUserById(id: string): User | null {
  return getAllUsers().find((u) => u.id === id) ?? null
}

export function saveUser(user: User): void {
  const users = getAllUsers().filter((u) => u.id !== user.id)
  setItem(STORAGE_KEYS.USERS, [...users, user])
}

export function getCurrentUserId(): string | null {
  return getItem<string>(STORAGE_KEYS.CURRENT_USER_ID)
}

export function setCurrentUserId(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID)
  } else {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, id)
  }
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId()
  return id ? getUserById(id) : null
}

// ─── Ayar işlemleri ──────────────────────────────────────────────────────────

export function getAllSettings(): WaterSettings[] {
  return getItem<WaterSettings[]>(STORAGE_KEYS.SETTINGS) ?? []
}

export function getSettingsByUserId(userId: string): WaterSettings | null {
  return getAllSettings().find((s) => s.userId === userId) ?? null
}

export function saveSettings(settings: WaterSettings): void {
  const all = getAllSettings().filter((s) => s.userId !== settings.userId)
  setItem(STORAGE_KEYS.SETTINGS, [...all, settings])
}

// ─── Günlük ilerleme işlemleri ───────────────────────────────────────────────

function getAllProgress(): DailyProgress[] {
  return getItem<DailyProgress[]>(STORAGE_KEYS.PROGRESS) ?? []
}

export function getDailyProgress(
  userId: string,
  date: string
): DailyProgress | null {
  return (
    getAllProgress().find(
      (p) => p.userId === userId && p.date === date
    ) ?? null
  )
}

export function getTodayProgress(userId: string): DailyProgress | null {
  const today = new Date().toISOString().split('T')[0]
  return getDailyProgress(userId, today)
}

export function saveDailyProgress(progress: DailyProgress): void {
  const all = getAllProgress().filter(
    (p) => !(p.userId === progress.userId && p.date === progress.date)
  )
  setItem(STORAGE_KEYS.PROGRESS, [...all, progress])
}

export function addReminderLog(
  userId: string,
  log: ReminderLog,
  goalMl: number
): DailyProgress {
  const today = new Date().toISOString().split('T')[0]
  const existing = getDailyProgress(userId, today)

  const reminders = existing ? [...existing.reminders, log] : [log]
  const totalConsumedMl = reminders
    .filter((r) => !r.skipped)
    .reduce((sum, r) => sum + r.amountMl, 0)

  const progress: DailyProgress = {
    date: today,
    userId,
    totalConsumedMl,
    goalMl,
    reminders,
    goalMet: totalConsumedMl >= goalMl,
  }

  saveDailyProgress(progress)
  return progress
}

// ─── Bildirim işlemleri ──────────────────────────────────────────────────────

export function getSavedNotifications(): NotificationPayload[] {
  return getItem<NotificationPayload[]>(STORAGE_KEYS.NOTIFICATIONS) ?? []
}

export function saveNotifications(notifications: NotificationPayload[]): void {
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifications)
}

// ─── Oturum kapatma ──────────────────────────────────────────────────────────

export function logout(): void {
  setCurrentUserId(null)
}