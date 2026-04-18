// components/Toast.tsx
'use client'

import { useEffect, useState } from 'react'
import { onToast, ToastOptions } from '@/lib/notifications'

interface ToastItem extends ToastOptions {
  id: string
}

const ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️' }
const COLORS = {
  info: 'bg-slate-800 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-amber-500 text-white',
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-fade-up ${
            COLORS[t.type ?? 'info']
          }`}
        >
          <span>{ICONS[t.type ?? 'info']}</span>
          <span>{t.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="ml-2 opacity-70 hover:opacity-100 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}