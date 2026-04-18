// components/DrinkButton.tsx
'use client'

import { useState } from 'react'
import { getCurrentUser, getSettingsByUserId, addReminderLog } from '@/lib/storage'
import { showToast } from '@/lib/notifications'
import { DailyProgress, ReminderLog } from '@/types'

interface Props {
  onDrink: (progress: DailyProgress) => void
}

export default function DrinkButton({ onDrink }: Props) {
  const [loading, setLoading] = useState(false)
  const [ripple, setRipple] = useState(false)

  async function handleDrink() {
    if (loading) return
    setLoading(true)
    setRipple(true)

    await new Promise((r) => setTimeout(r, 150))

    const user = getCurrentUser()
    if (!user) { setLoading(false); return }

    const settings = getSettingsByUserId(user.id)
    if (!settings) {
      showToast({ message: 'Önce ayarları tamamla!', type: 'warning' })
      setLoading(false)
      return
    }

    const log: ReminderLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      amountMl: settings.amountPerDrinkMl,
      skipped: false,
    }

    const progress = addReminderLog(user.id, log, settings.dailyGoalMl)
    onDrink(progress)

    if (progress.goalMet) {
      showToast({
        message: '🎉 Günlük hedefe ulaştın! Harika!',
        type: 'success',
        duration: 5000,
      })
    } else {
      const remaining = progress.goalMl - progress.totalConsumedMl
      showToast({
        message: `💧 ${settings.amountPerDrinkMl}ml içildi! ${remaining}ml kaldı.`,
        type: 'success',
      })
    }

    setTimeout(() => setRipple(false), 600)
    setLoading(false)
  }

  async function handleSkip() {
    const user = getCurrentUser()
    if (!user) return

    const settings = getSettingsByUserId(user.id)
    if (!settings) return

    const log: ReminderLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      amountMl: 0,
      skipped: true,
    }

    const progress = addReminderLog(user.id, log, settings.dailyGoalMl)
    onDrink(progress)
    showToast({ message: 'Hatırlatıcı atlandı.', type: 'info' })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ana buton */}
      <button
        onClick={handleDrink}
        disabled={loading}
        className={`relative w-36 h-36 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-2xl shadow-blue-300 transition-all duration-200 flex flex-col items-center justify-center gap-1 overflow-hidden disabled:opacity-60 ${
          ripple ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Ripple efekti */}
        {ripple && (
          <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
        )}
        <span className="text-4xl">💧</span>
        <span className="text-xs font-semibold tracking-wide">SU İÇTİM</span>
      </button>

      {/* Atla butonu */}
      <button
        onClick={handleSkip}
        className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
      >
        Bu hatırlatıcıyı atla
      </button>
    </div>
  )
}