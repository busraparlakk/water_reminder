// app/setup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getSettingsByUserId, saveSettings } from '@/lib/storage'
import { buildSchedule, calcIntervalMinutes, getActiveMinutes } from '@/lib/scheduler'
import { setupDailyNotifications } from '@/lib/notifications'
import { WaterSettings } from '@/types'

const PRESET_GOALS = [1500, 2000, 2500, 3000]
const PRESET_AMOUNTS = [150, 200, 250, 300]

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    dailyGoalMl: 2000,
    wakeTime: '07:00',
    sleepTime: '23:00',
    amountPerDrinkMl: 250,
  })

  // Mevcut ayarları yükle (düzenleme modu)
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push('/login'); return }

    const existing = getSettingsByUserId(user.id)
    if (existing) {
      setForm({
        dailyGoalMl: existing.dailyGoalMl,
        wakeTime: existing.wakeTime,
        sleepTime: existing.sleepTime,
        amountPerDrinkMl: existing.amountPerDrinkMl,
      })
      setSaved(true)
    }
  }, [router])

  // Önizleme hesapla
  const previewSettings: WaterSettings = {
    userId: '',
    ...form,
    intervalMinutes: 0,
  }
  const interval = calcIntervalMinutes(previewSettings)
  const activeHours = Math.floor(getActiveMinutes(previewSettings) / 60)
  const activeMin = getActiveMinutes(previewSettings) % 60
  const drinksNeeded = Math.ceil(form.dailyGoalMl / form.amountPerDrinkMl)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const user = getCurrentUser()
    if (!user) { router.push('/login'); return }

    const settings: WaterSettings = {
      userId: user.id,
      ...form,
      intervalMinutes: interval,
    }

    saveSettings(settings)

    const schedule = buildSchedule(settings)
    await setupDailyNotifications(schedule)

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="text-2xl font-bold text-slate-800">
            {saved ? 'Ayarlarını Güncelle' : 'Hedefini Belirle'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Uyku düzenine göre hatırlatıcılar otomatik ayarlanır
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Günlük Su Hedefi */}
          <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">
              💧 Günlük Su Hedefi
            </h2>

            {/* Preset butonlar */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESET_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, dailyGoalMl: g }))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    form.dailyGoalMl === g
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g}ml
                </button>
              ))}
            </div>

            {/* Manuel giriş */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={500}
                max={4000}
                step={100}
                value={form.dailyGoalMl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dailyGoalMl: Number(e.target.value) }))
                }
                className="flex-1 accent-blue-600"
              />
              <span className="text-blue-700 font-bold w-20 text-right">
                {form.dailyGoalMl} ml
              </span>
            </div>
          </div>

          {/* Her İçişte Ne Kadar */}
          <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">
              🥤 Her İçişte Ne Kadar?
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, amountPerDrinkMl: a }))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    form.amountPerDrinkMl === a
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {a}ml
                </button>
              ))}
            </div>
          </div>

          {/* Uyku Düzeni */}
          <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">
              🌙 Uyku Düzenin
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Uyanma Saati
                </label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, wakeTime: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Uyku Saati
                </label>
                <input
                  type="time"
                  value={form.sleepTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sleepTime: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Canlı Önizleme */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <h2 className="font-semibold mb-4 opacity-90">📊 Günlük Program Özeti</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{drinksNeeded}</div>
                <div className="text-xs opacity-75 mt-1">içiş / gün</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{interval}dk</div>
                <div className="text-xs opacity-75 mt-1">aralık</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activeHours}s {activeMin}dk
                </div>
                <div className="text-xs opacity-75 mt-1">aktif süre</div>
              </div>
            </div>
          </div>

          {/* Kaydet */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all shadow-lg shadow-blue-200 disabled:opacity-60"
          >
            {loading
              ? '⏳ Kuruluyor...'
              : saved
              ? '✅ Güncelle & Bildirimleri Yeniden Kur'
              : '🚀 Başlat & Bildirimleri Kur'}
          </button>
        </form>
      </div>
    </main>
  )
}