// components/DrinkButton.tsx
'use client'

import { useState } from 'react'
import { getCurrentUser, getSettingsByUserId, addReminderLog } from '@/lib/storage'
import { showToast } from '@/lib/notifications'
import { DailyProgress, ReminderLog } from '@/types'

interface Props { onDrink: (progress: DailyProgress) => void }

export default function DrinkButton({ onDrink }: Props) {
  const [loading,  setLoading]  = useState(false)
  const [pressing, setPressing] = useState(false)

  async function handleDrink() {
    if (loading) return
    setLoading(true)
    setPressing(true)
    await new Promise((r) => setTimeout(r, 180))

    const user = getCurrentUser()
    if (!user) { setLoading(false); return }

    const settings = getSettingsByUserId(user.id)
    if (!settings) {
      showToast({ message: 'Önce ayarları tamamla!', type: 'warning' })
      setLoading(false); setPressing(false); return
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
      showToast({ message: '🎉 Günlük hedefe ulaştın! Muhteşem!', type: 'success', duration: 5000 })
    } else {
      const remaining = progress.goalMl - progress.totalConsumedMl
      showToast({ message: `💧 ${settings.amountPerDrinkMl}ml içildi! ${remaining}ml kaldı.`, type: 'success' })
    }

    setTimeout(() => setPressing(false), 500)
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
    <div className="flex flex-col items-center gap-5">
      {/* Orbit halkalar */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>

        {/* Dış orbit */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(99,179,237,0.15)',
        }} />
        <div style={{
          position: 'absolute', inset: 12,
          borderRadius: '50%',
          border: '1px solid rgba(99,179,237,0.1)',
        }} />

        {/* Orbit damlalar */}
        {[
          { color: '#63b3ed', delay: '0s',     size: 10 },
          { color: '#4fd1c7', delay: '-1.33s', size: 8  },
          { color: '#818cf8', delay: '-2.66s', size: 7  },
        ].map((drop, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: drop.size, height: drop.size,
            borderRadius: '50%',
            background: drop.color,
            boxShadow: `0 0 8px ${drop.color}`,
            top: '50%', left: '50%',
            marginTop: -drop.size / 2,
            marginLeft: -drop.size / 2,
            animation: `orbit 4s linear infinite`,
            animationDelay: drop.delay,
          }} />
        ))}

        {/* Ana buton */}
        <button
          onClick={handleDrink}
          disabled={loading}
          style={{
            position: 'absolute', inset: 20,
            borderRadius: '50%',
            background: pressing
              ? 'linear-gradient(135deg,#1d4ed8,#0f766e)'
              : 'linear-gradient(135deg,#2563eb,#0d9488)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4,
            transform: pressing ? 'scale(0.92)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: pressing
              ? '0 0 20px rgba(37,99,235,0.3)'
              : '0 0 40px rgba(37,99,235,0.5), 0 0 80px rgba(13,148,136,0.2)',
            animation: pressing ? 'none' : 'glow-pulse 2.5s ease-in-out infinite',
          }}
        >
          {/* Ripple */}
          {pressing && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              animation: 'ripple 0.6s ease-out forwards',
            }} />
          )}
          <span style={{ fontSize: 36 }}>💧</span>
          <span style={{
            fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
          }}>
            Su İçtim
          </span>
        </button>
      </div>

      <button
        onClick={handleSkip}
        style={{
          background: 'none', border: 'none',
          color: 'var(--text-muted)',
          fontSize: 12, cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationColor: 'var(--border-glow)',
          textUnderlineOffset: 3,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        Bu hatırlatıcıyı atla
      </button>
    </div>
  )
}