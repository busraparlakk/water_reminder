// components/ReminderSchedule.tsx
'use client'

import { NotificationPayload } from '@/types'

interface Props { schedule: NotificationPayload[]; consumedCount: number }

export default function ReminderSchedule({ schedule, consumedCount }: Props) {
  const now = new Date()

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  function getStatus(index: number, scheduledAt: string) {
    if (index < consumedCount) return 'done'
    if (new Date(scheduledAt) < now) return 'missed'
    return 'upcoming'
  }

  const STATUS = {
    done:     { dot: '#0d9488', dotGlow: 'rgba(13,148,136,0.6)', bg: 'rgba(13,148,136,0.08)',  border: 'rgba(13,148,136,0.2)',  tag: '✦ İçildi',   tagColor: '#4fd1c7' },
    missed:   { dot: '#ef4444', dotGlow: 'rgba(239,68,68,0.4)',  bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.15)',  tag: '⏭ Atlandı',  tagColor: '#fca5a5' },
    upcoming: { dot: 'rgba(147,197,253,0.3)', dotGlow: 'none',   bg: 'rgba(255,255,255,0.02)', border: 'var(--border-subtle)', tag: '○ Bekliyor',  tagColor: 'var(--text-muted)' },
  }

  const nextIndex = schedule.findIndex((_, i) => getStatus(i, schedule[i].scheduledAt) === 'upcoming')

  return (
    <div className="glass p-6">
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-4 flex items-center gap-2"
        style={{ color: 'var(--text-muted)' }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg,#3b82f6,#0d9488)',
          display: 'inline-block',
        }} />
        Günlük Program
      </h2>

      {schedule.length === 0 ? (
        <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Henüz program oluşturulmadı.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 280 }}>
          {schedule.map((item, i) => {
            const status = getStatus(i, item.scheduledAt)
            const s = STATUS[status]
            const isNext = i === nextIndex

            return (
              <div key={item.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{
                  background: isNext ? 'rgba(37,99,235,0.12)' : s.bg,
                  border: `1px solid ${isNext ? 'rgba(99,179,237,0.35)' : s.border}`,
                  boxShadow: isNext ? '0 0 16px rgba(37,99,235,0.15)' : 'none',
                }}
              >
                {/* Nokta */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isNext ? '#63b3ed' : s.dot,
                  boxShadow: isNext ? '0 0 8px #63b3ed' : s.dotGlow !== 'none' ? `0 0 6px ${s.dotGlow}` : 'none',
                  flexShrink: 0,
                  animation: isNext ? 'pulse-ring 1.5s ease-out infinite' : 'none',
                }} />

                {/* Saat */}
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isNext ? '#93c5fd' : 'var(--text-secondary)',
                  width: 36, flexShrink: 0,
                }}>
                  {formatTime(item.scheduledAt)}
                </span>

                {/* Mesaj */}
                <span style={{
                  fontSize: 11, flex: 1,
                  color: isNext ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.body}
                </span>

                {/* Durum etiketi */}
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: isNext ? '#63b3ed' : s.tagColor,
                  flexShrink: 0,
                }}>
                  {isNext ? '● Şimdi' : s.tag}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}