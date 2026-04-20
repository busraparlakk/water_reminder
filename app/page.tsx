// app/setup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getSettingsByUserId, saveSettings } from '@/lib/storage'
import { buildSchedule, calcIntervalMinutes, getActiveMinutes } from '@/lib/scheduler'
import { setupDailyNotifications } from '@/lib/notifications'
import { WaterSettings } from '@/types'

const PRESET_GOALS   = [1500, 2000, 2500, 3000]
const PRESET_AMOUNTS = [150, 200, 250, 300]

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState({
    dailyGoalMl:      2000,
    wakeTime:         '07:00',
    sleepTime:        '23:00',
    amountPerDrinkMl: 250,
  })

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    if (!user) { router.push('/login'); return }
    const existing = getSettingsByUserId(user.id)
    if (existing) {
      setForm({
        dailyGoalMl:      existing.dailyGoalMl,
        wakeTime:         existing.wakeTime,
        sleepTime:        existing.sleepTime,
        amountPerDrinkMl: existing.amountPerDrinkMl,
      })
      setSaved(true)
    }
  }, [router])

  const previewSettings: WaterSettings = {
    userId: '', ...form, intervalMinutes: 0,
  }
  const interval     = calcIntervalMinutes(previewSettings)
  const totalMin     = getActiveMinutes(previewSettings)
  const activeHours  = Math.floor(totalMin / 60)
  const activeMins   = totalMin % 60
  const drinksNeeded = Math.ceil(form.dailyGoalMl / form.amountPerDrinkMl)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const user = getCurrentUser()
    if (!user) { router.push('/login'); return }

    const settings: WaterSettings = {
      userId: user.id, ...form, intervalMinutes: interval,
    }
    saveSettings(settings)
    const schedule = buildSchedule(settings)
    await setupDailyNotifications(schedule)
    setLoading(false)
    router.push('/')
  }

  return (
    <main className="bg-mesh min-h-screen px-4 py-10 relative overflow-hidden">

      {/* Orb'lar */}
      <div className="orb w-96 h-96 bg-blue-600/15 -top-32 -right-32" />
      <div className="orb w-72 h-72 bg-teal-500/10 bottom-0 -left-24" />

      <div className={`max-w-lg mx-auto relative z-10 transition-all duration-700 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4 animate-glow">
            <span style={{ fontSize: 28 }}>⚙️</span>
          </div>
          <h1 className="text-2xl font-bold text-shimmer">
            {saved ? 'Ayarlarını Güncelle' : 'Hedefini Belirle'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Uyku düzenine göre hatırlatıcılar otomatik ayarlanır
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Günlük Su Hedefi */}
          <div className="glass p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}>
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-base">💧</span>
              Günlük Su Hedefi
            </h2>

            <div className="grid grid-cols-4 gap-2 mb-5">
              {PRESET_GOALS.map((g) => (
                <button
                  key={g} type="button"
                  onClick={() => setForm((p) => ({ ...p, dailyGoalMl: g }))}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={
                    form.dailyGoalMl === g
                      ? {
                          background: 'linear-gradient(135deg,#2563eb,#0d9488)',
                          color: 'white',
                          boxShadow: '0 0 16px rgba(37,99,235,0.4)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glow)',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  {g}ml
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range" min={500} max={4000} step={100}
                value={form.dailyGoalMl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dailyGoalMl: Number(e.target.value) }))
                }
                className="flex-1"
              />
              <span className="text-lg font-black w-24 text-right text-shimmer">
                {form.dailyGoalMl}ml
              </span>
            </div>
          </div>

          {/* Her İçişte Ne Kadar */}
          <div className="glass p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}>
              <span className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-base">🥤</span>
              Her İçişte Ne Kadar?
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a} type="button"
                  onClick={() => setForm((p) => ({ ...p, amountPerDrinkMl: a }))}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={
                    form.amountPerDrinkMl === a
                      ? {
                          background: 'linear-gradient(135deg,#0d9488,#06b6d4)',
                          color: 'white',
                          boxShadow: '0 0 16px rgba(13,148,136,0.4)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glow)',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  {a}ml
                </button>
              ))}
            </div>
          </div>

          {/* Uyku Düzeni */}
          <div className="glass p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}>
              <span className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-base">🌙</span>
              Uyku Düzenin
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  ☀️ Uyanma Saati
                </label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={(e) => setForm((p) => ({ ...p, wakeTime: e.target.value }))}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  🌙 Uyku Saati
                </label>
                <input
                  type="time"
                  value={form.sleepTime}
                  onChange={(e) => setForm((p) => ({ ...p, sleepTime: e.target.value }))}
                  className="input-glass"
                />
              </div>
            </div>
          </div>

          {/* Canlı Önizleme */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(13,148,136,0.3))',
              border: '1px solid rgba(99,179,237,0.3)',
            }}>
            {/* Parlama efekti */}
            <div className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(99,179,237,0.5), transparent 70%)',
              }} />

            <h2 className="text-xs font-semibold mb-5 relative z-10"
              style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
              ✦ GÜNLÜK PROGRAM ÖZETİ
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center relative z-10">
              {[
                { value: drinksNeeded, unit: 'içiş', label: 'Günde', icon: '🔄' },
                { value: `${interval}dk`, unit: '', label: 'Aralık', icon: '⏱️' },
                { value: `${activeHours}s ${activeMins}dk`, unit: '', label: 'Aktif Süre', icon: '⚡' },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-3">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-4 text-sm font-bold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                  style={{ animation: 'spin 0.8s linear infinite' }} />
                Kuruluyor...
              </span>
            ) : saved
              ? '✅ Güncelle & Bildirimleri Yeniden Kur'
              : '🚀 Başlat & Bildirimleri Kur'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}