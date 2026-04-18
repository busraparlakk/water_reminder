// components/WaterProgress.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  consumed: number
  goal: number
}

export default function WaterProgress({ consumed, goal }: Props) {
  const [animated, setAnimated] = useState(0)
  const percent = Math.min((consumed / goal) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(percent), 100)
    return () => clearTimeout(timer)
  }, [percent])

  const color =
    percent >= 100
      ? 'from-green-400 to-emerald-500'
      : percent >= 60
      ? 'from-blue-400 to-blue-600'
      : percent >= 30
      ? 'from-sky-300 to-blue-500'
      : 'from-slate-200 to-slate-300'

  const emoji =
    percent >= 100 ? '🎉' : percent >= 60 ? '💪' : percent >= 30 ? '💧' : '🫗'

  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-blue-100 p-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-600">Günlük İlerleme</span>
        <span className="text-sm font-bold text-blue-700">
          {consumed}ml / {goal}ml
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${animated}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-3">
        <span className="text-2xl">{emoji}</span>
        <span
          className={`text-sm font-semibold ${
            percent >= 100 ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          {percent >= 100
            ? 'Hedefe ulaştın!'
            : `%${Math.round(percent)} tamamlandı`}
        </span>
      </div>

      {/* Mini istatistik */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-blue-700">{consumed}ml</div>
          <div className="text-xs text-slate-500">İçilen</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-slate-600">
            {Math.max(goal - consumed, 0)}ml
          </div>
          <div className="text-xs text-slate-500">Kalan</div>
        </div>
      </div>
    </div>
  )
}