'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getSettingsByUserId,
  getTodayProgress,
  getSavedNotifications,
  logout,
} from '@/lib/storage'
import { restoreScheduledNotifications, showToast } from '@/lib/notifications'
import { getNextReminder, minutesUntilNext } from '@/lib/scheduler'
import WaterProgress from '@/components/WaterProgress'
import DrinkButton from '@/components/DrinkButton'
import ReminderSchedule from '@/components/ReminderSchedule'
import Toast from '@/components/Toast'
import { DailyProgress, NotificationPayload, User, WaterSettings } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<WaterSettings | null>(null)
  const [progress, setProgress] = useState<DailyProgress | null>(null)
  const [schedule, setSchedule] = useState<NotificationPayload[]>([])
  const [nextReminder, setNextReminder] = useState<NotificationPayload | null>(null)
  const [minutesLeft, setMinutesLeft] = useState<number>(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { router.push('/login'); return }
    const s = getSettingsByUserId(u.id)
    if (!s) { router.push('/setup'); return }
    const p = getTodayProgress(u.id)
    const saved = getSavedNotifications()
    const next = getNextReminder(saved)
    setUser(u)
    setSettings(s)
    setProgress(p)
    setSchedule(saved)
    setNextReminder(next)
    setMinutesLeft(next ? minutesUntilNext(next) : 0)
    restoreScheduledNotifications()
    setReady(true)
  }, [router])

  useEffect(() => {
    if (!nextReminder) return
    const tick = setInterval(() => {
      setMinutesLeft(minutesUntilNext(nextReminder))
    }, 60000)
    return () => clearInterval(tick)
  }, [nextReminder])

  function handleDrink(newProgress: DailyProgress) {
    setProgress(newProgress)
  }

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="text-blue-400 text-4xl animate-bounce">💧</div>
      </div>
    )
  }

  const consumed = progress?.totalConsumedMl ?? 0
  const goal = settings?.dailyGoalMl ?? 2000
  const consumedCount = progress?.reminders.filter((r) => !r.skipped).length ?? 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <Toast />
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <div>
              <div className="text-sm font-bold text-slate-800 leading-tight">
                Merhaba, {user?.name?.split(' ')[0]}!
              </div>
              <div className="text-xs text-slate-400">
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/setup')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              ⚙️ Ayarlar
            </button>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {nextReminder && (
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg shadow-blue-200">
            <div>
              <div className="text-xs opacity-75 mb-0.5">Sonraki hatırlatıcı</div>
              <div className="font-bold text-lg">
                {new Date(nextReminder.scheduledAt).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{minutesLeft}dk</div>
              <div className="text-xs opacity-75">sonra</div>
            </div>
          </div>
        )}

        <WaterProgress consumed={consumed} goal={goal} />

        <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-8 flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500 mb-2">
            Her içişte{' '}
            <span className="font-semibold text-blue-600">
              {settings?.amountPerDrinkMl}ml
            </span>{' '}
            sayılır
          </p>
          <DrinkButton onDrink={handleDrink} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'İçiş', value: consumedCount, unit: 'kez', color: 'text-blue-600' },
            {
              label: 'Hedef',
              value: `%${Math.min(Math.round((consumed / goal) * 100), 100)}`,
              unit: '',
              color: consumed >= goal ? 'text-green-600' : 'text-amber-500',
            },
            { label: 'Kalan', value: Math.max(goal - consumed, 0), unit: 'ml', color: 'text-slate-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-4 text-center">
              <div className={`text-xl font-black ${stat.color}`}>
                {stat.value}
                <span className="text-xs font-normal ml-0.5">{stat.unit}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <ReminderSchedule schedule={schedule} consumedCount={consumedCount} />

        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5 text-center">
          <div className="text-2xl mb-1">
            {consumed >= goal ? '🏆' : consumed >= goal * 0.5 ? '💪' : '🌊'}
          </div>
          <p className="text-sm text-slate-600 font-medium">
            {consumed >= goal
              ? 'Mükemmel! Bugün hedefine ulaştın!'
              : consumed >= goal * 0.5
              ? 'Yarıyı geçtin, devam et!'
              : 'Her damla önemli, başla!'}
          </p>
        </div>
      </div>
    </main>
  )
}
