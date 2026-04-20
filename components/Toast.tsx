// components/Toast.tsx
'use client'

import { useEffect, useState } from 'react'
import { onToast, ToastOptions } from '@/lib/notifications'

interface ToastItem extends ToastOptions { id: string }

const CONFIG = {
  info:    { icon: 'ℹ️', color: 'rgba(99,179,237,0.15)',  border: 'rgba(99,179,237,0.4)' },
  success: { icon: '✦',  color: 'rgba(13,148,136,0.15)',  border: 'rgba(20,184,166,0.4)' },
  warning: { icon: '⚡', color: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)' },
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsub = onToast((options) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { ...options, id }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, options.duration ?? 4000)
    })
    return unsub
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => {
        const cfg = CONFIG[t.type ?? 'info']
        return (
          <div
            key={t.id}
            className="animate-fade-up"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              borderRadius: 16,
              background: `rgba(10,15,46,0.85)`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${cfg.border}`,
              boxShadow: `0 0 24px ${cfg.color}, 0 8px 32px rgba(0,0,0,0.4)`,
              fontSize: 13,
              fontWeight: 500,
              color: 'white',
              whiteSpace: 'nowrap',
              minWidth: 200,
            }}
          >
            <span style={{ fontSize: 16 }}>{cfg.icon}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(147,197,253,0.5)',
                cursor: 'pointer',
                fontSize: 12,
                padding: '0 0 0 8px',
              }}
            >✕</button>
          </div>
        )
      })}
    </div>
  )
}