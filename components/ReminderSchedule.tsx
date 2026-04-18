// components/ReminderSchedule.tsx
'use client'

import { NotificationPayload } from '@/types'

interface Props {
  schedule: NotificationPayload[]
  consumedCount: number
}

export default function ReminderSchedule({ schedule, consumedCount }: Props) {
  const now = new Date()

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatus(index: number, scheduledAt: string) {
    const scheduledDate = new Date(scheduledAt)
    if (index < consumedCount) return 'done'
    if (scheduledDate < now) return 'missed'
    return 'upcoming'
  }

  const STATUS_STYLE = {
    done: 'bg-green-100 border-green-200 text-green-700',
    missed: 'bg-red-50 border-red-200 text-red-400',
    upcoming: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  const STATUS_ICON = { done: '✅', missed: '⏭️', upcoming: '🕐' }
  const STATUS_LABEL = { done: 'İçildi', missed: 'Atlandı', upcoming: 'Bekliyor' }

  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-6">
      <h2 className="font-semibold text-slate-700 mb-4">📅 Günlük Program</h2>

      {schedule.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          Henüz program oluşturulmadı.
        </p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {schedule.map((item, i) => {
            const status = getStatus(i, item.scheduledAt)
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${STATUS_STYLE[status]}`}
              >
                <span className="text-base">{STATUS_ICON[status]}</span>
                <span className="font-medium w-12 shrink-0">
                  {formatTime(item.scheduledAt)}
                </span>
                <span className="flex-1 truncate opacity-80">{item.body}</span>
                <span className="text-xs opacity-60 shrink-0">
                  {STATUS_LABEL[status]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}