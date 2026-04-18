// types/index.ts

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface WaterSettings {
  userId: string
  dailyGoalMl: number       // Günlük hedef (örn: 2000ml)
  wakeTime: string          // Uyanma saati "07:00"
  sleepTime: string         // Uyku saati "23:00"
  intervalMinutes: number   // Bildirim aralığı (hesaplanır)
  amountPerDrinkMl: number  // Her içişte kaç ml (örn: 250ml)
}

export interface ReminderLog {
  id: string
  userId: string
  timestamp: string         // ISO string
  amountMl: number
  skipped: boolean
}

export interface DailyProgress {
  date: string              // "2024-01-15"
  userId: string
  totalConsumedMl: number
  goalMl: number
  reminders: ReminderLog[]
  goalMet: boolean
}

export interface NotificationPayload {
  id: string
  title: string
  body: string
  scheduledAt: string       // ISO string
  type: 'reminder' | 'goal-reached' | 'morning' | 'evening'
}

export interface AppState {
  currentUser: User | null
  settings: WaterSettings | null
  todayProgress: DailyProgress | null
}

// localStorage key sabitleri — tüm projede bu isimleri kullanacağız
export const STORAGE_KEYS = {
  USERS: 'wh_users',
  CURRENT_USER_ID: 'wh_current_user_id',
  SETTINGS: 'wh_settings',
  PROGRESS: 'wh_progress',
  NOTIFICATIONS: 'wh_notifications',
} as const