// components/WaterProgress.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props { consumed: number; goal: number }

export default function WaterProgress({ consumed, goal }: Props) {
  const [animated, setAnimated] = useState(0)
  const percent = Math.min((consumed / goal) * 100, 100)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 120)
    return () => clearTimeout(t)
  }, [percent])

  const fillColor =
    percent >= 100
      ? 'linear-gradient(180deg,#10b981,#059669)'
      : percent >= 60
      ? 'linear-gradient(180deg,#3b82f6,#0d9488)'
      : percent >= 30
      ? 'linear-gradient(180deg,#60a5fa,#2563eb)'
      : 'linear-gradient(180deg,#334155,#1e293b)'

  const glowColor =
    percent >= 100 ? 'rgba(16,185,129,0.5)'
    : percent >= 60 ? 'rgba(59,130,246,0.5)'
    : 'rgba(37,99,235,0.3)'

  return (
    <div className="glass p-6">
      {/* Üst bilgi */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)' }}>
          Günlük İlerleme
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          {consumed}ml
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {goal}ml</span>
        </span>
      </div>

      {/* Su küresi */}
      <div className="flex flex-col items-center py-2">
        <div style={{ position: 'relative', width: 140, height: 140 }}>

          {/* Dış halka */}
          <div style={{
            position: 'absolute', inset: -8,
            borderRadius: '50%',
            border: `2px solid ${glowColor}`,
            animation: 'pulse-ring 2.5s ease-out infinite',
          }} />

          {/* Küre */}
          <div style={{
            width: 140, height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: `2px solid rgba(99,179,237,0.25)`,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 0 32px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.3)`,
          }}>
            {/* Su dolu kısım */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: `${animated}%`,
              background: fillColor,
              transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1)',
            }} />

            {/* Dalga */}
            <div style={{
              position: 'absolute',
              bottom: `${animated}%`,
              left: 0,
              width: '200%',
              height: 18,
              marginBottom: -9,
              opacity: 0.6,
            }}>
              <svg viewBox="0 0 200 18" preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', animation: 'wave 2s linear infinite' }}>
                <path
                  d="M0 9 Q25 0 50 9 Q75 18 100 9 Q125 0 150 9 Q175 18 200 9 Q225 0 250 9 Q275 18 300 9 V18 H0Z"
                  fill="#3b82f6" fillOpacity="0.6"
                />
              </svg>
            </div>

            {/* Yüzde yazısı */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 3,
            }}>
              <span style={{
                fontSize: 28, fontWeight: 800, color: 'white',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                {Math.round(percent)}%
              </span>
              <span style={{
                fontSize: 9, letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
              }}>
                {percent >= 100 ? 'Tamamlandı' : 'tamamlandı'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alt istatistikler */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { label: 'İçilen',  value: `${consumed}ml`,            color: '#63b3ed' },
          { label: 'Hedef',   value: `${goal}ml`,                color: 'var(--text-muted)' },
          { label: 'Kalan',   value: `${Math.max(goal-consumed,0)}ml`, color: '#4fd1c7' },
        ].map((s) => (
          <div key={s.label} className="text-center rounded-xl py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}