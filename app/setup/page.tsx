// app/setup/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getSettingsByUserId, saveSettings, saveNotifications } from '@/lib/storage'
import { buildSchedule, calcIntervalMinutes } from '@/lib/scheduler'
import type { WaterSettings } from '@/types'

export default function SetupPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  const [form, setForm] = useState({
    dailyGoalMl: 2000,
    wakeTime: '07:00',
    sleepTime: '23:00',
    amountPerDrinkMl: 250,
  })

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { setRedirectTo('/login'); return }

    // Ayarlar zaten varsa dashboard'a git
    const existing = getSettingsByUserId(u.id)
    if (existing) { setRedirectTo('/'); return }

    setUserId(u.id)
    setMounted(true)
  }, []) // eslint-disable-line

  useEffect(() => {
    if (redirectTo) router.push(redirectTo)
  }, [redirectTo]) // eslint-disable-line

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'wakeTime' || name === 'sleepTime' ? value : Number(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    const settings: WaterSettings = {
      userId,
      dailyGoalMl: form.dailyGoalMl,
      wakeTime: form.wakeTime,
      sleepTime: form.sleepTime,
      amountPerDrinkMl: form.amountPerDrinkMl,
      intervalMinutes: calcIntervalMinutes({
        userId,
        ...form,
        intervalMinutes: 0,
      }),
    }

    saveSettings(settings)
    const schedule = buildSchedule(settings)
    saveNotifications(schedule)

    router.push('/')
  }

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0f2e',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, animation: 'float 2s ease-in-out infinite' }}>💧</div>
          <div style={{
            marginTop: 16, fontSize: 12,
            letterSpacing: '0.15em',
            color: 'rgba(147,197,253,0.5)',
            textTransform: 'uppercase',
          }}>
            Yükleniyor...
          </div>
        </div>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
      </div>
    )
  }

  const drinksNeeded = Math.ceil(form.dailyGoalMl / form.amountPerDrinkMl)

  return (
    <main className="bg-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(37,99,235,0.2),transparent)', top: -100, left: -100 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(13,148,136,0.15),transparent)', bottom: 100, right: -80 }} />

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563eb,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 0 32px rgba(37,99,235,0.4)',
            animation: 'glow-pulse 2.5s ease-in-out infinite',
          }}>
            💧
          </div>
          <h1 className="text-shimmer" style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            Hedefini Belirle
          </h1>
          <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(147,197,253,0.55)' }}>
            Günlük su içme programını kişiselleştir
          </p>
        </div>

        {/* Form Kartı */}
        <div className="glass-strong" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Günlük Hedef */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(147,197,253,0.85)' }}>
                  💧 Günlük Su Hedefi
                </label>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  background: 'linear-gradient(90deg,#63b3ed,#4fd1c7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {form.dailyGoalMl} ml
                </span>
              </div>
              <input
                type="range"
                name="dailyGoalMl"
                min={500} max={5000} step={250}
                value={form.dailyGoalMl}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(147,197,253,0.35)', marginTop: 4 }}>
                <span>500ml</span><span>5000ml</span>
              </div>
            </div>

            {/* Her İçişte */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(147,197,253,0.85)' }}>
                  🥤 Her İçişte
                </label>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  background: 'linear-gradient(90deg,#63b3ed,#4fd1c7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {form.amountPerDrinkMl} ml
                </span>
              </div>
              <input
                type="range"
                name="amountPerDrinkMl"
                min={100} max={500} step={50}
                value={form.amountPerDrinkMl}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(147,197,253,0.35)', marginTop: 4 }}>
                <span>100ml</span><span>500ml</span>
              </div>
            </div>

            {/* Saat Ayarları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(147,197,253,0.85)', marginBottom: 8 }}>
                  ☀️ Uyanma Saati
                </label>
                <input
                  type="time"
                  name="wakeTime"
                  value={form.wakeTime}
                  onChange={handleChange}
                  className="input-glass"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(147,197,253,0.85)', marginBottom: 8 }}>
                  🌙 Uyku Saati
                </label>
                <input
                  type="time"
                  name="sleepTime"
                  value={form.sleepTime}
                  onChange={handleChange}
                  className="input-glass"
                />
              </div>
            </div>

            {/* Özet */}
            <div style={{
              borderRadius: 14, padding: '14px 16px',
              background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(99,179,237,0.2)',
              fontSize: 13, color: 'rgba(147,197,253,0.7)',
              lineHeight: 1.6,
            }}>
              Günde yaklaşık{' '}
              <span style={{ color: '#63b3ed', fontWeight: 700 }}>{drinksNeeded} kez</span>{' '}
              su içmen hatırlatılacak.
            </div>

            {/* Kaydet */}
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient"
              style={{ padding: '16px', fontSize: 15, fontWeight: 700, borderRadius: 14, marginTop: 4 }}
            >
              {saving ? '⏳ Kaydediliyor...' : '🚀 Başla!'}
            </button>

          </form>
        </div>
      </div>
    </main>
  )
}