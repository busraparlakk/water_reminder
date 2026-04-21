/* eslint-disable */
'use client'

import { useRouter } from 'next/navigation'
import { getCurrentUser, getSettingsByUserId, getTodayProgress, getSavedNotifications, logout } from '@/lib/storage'
import { restoreScheduledNotifications } from '@/lib/notifications'
import { getNextReminder, minutesUntilNext } from '@/lib/scheduler'
import WaterProgress from '@/components/WaterProgress'
import DrinkButton from '@/components/DrinkButton'
import ReminderSchedule from '@/components/ReminderSchedule'
import Toast from '@/components/Toast'
import type { DailyProgress, NotificationPayload, User, WaterSettings } from '@/types'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<WaterSettings | null>(null)
  const [progress, setProgress] = useState<DailyProgress | null>(null)
  const [schedule, setSchedule] = useState<NotificationPayload[]>([])
  const [nextReminder, setNextReminder] = useState<NotificationPayload | null>(null)
  const [minutesLeft, setMinutesLeft] = useState(0)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { setRedirectTo('/login'); return }

    const s = getSettingsByUserId(u.id)
    if (!s) { setRedirectTo('/setup'); return }

    const p     = getTodayProgress(u.id)
    const saved = getSavedNotifications()
    const next  = getNextReminder(saved)

    setUser(u)
    setSettings(s)
    setProgress(p)
    setSchedule(saved)
    setNextReminder(next)
    setMinutesLeft(next ? minutesUntilNext(next) : 0)
    restoreScheduledNotifications()
    setReady(true)
  }, []) // eslint-disable-line

  useEffect(() => {
    if (redirectTo) router.push(redirectTo)
  }, [redirectTo]) // eslint-disable-line

  useEffect(() => {
    if (!nextReminder) return
    const tick = setInterval(() => {
      setMinutesLeft(minutesUntilNext(nextReminder))
    }, 60000)
    return () => clearInterval(tick)
  }, [nextReminder])

  function handleDrink(newProgress: DailyProgress) {
    setProgress(newProgress)
  }

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (!ready) {
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
      </div>
    )
  }

  const consumed      = progress?.totalConsumedMl ?? 0
  const goal          = settings?.dailyGoalMl ?? 2000
  const consumedCount = progress?.reminders.filter((r) => !r.skipped).length ?? 0
  const percent       = Math.min(Math.round((consumed / goal) * 100), 100)

  const mot =
    percent >= 100 ? { icon: '🏆', text: 'Mükemmel! Bugün hedefe ulaştın!', color: '#4fd1c7' } :
    percent >= 75  ? { icon: '🔥', text: 'Neredeyse bitti, son adım!',       color: '#63b3ed' } :
    percent >= 50  ? { icon: '💪', text: 'Yarıyı geçtin, devam et!',         color: '#93c5fd' } :
    percent >= 25  ? { icon: '🌊', text: 'İyi gidiyorsun, durmaa!',          color: '#7dd3fc' } :
                     { icon: '✨', text: 'Güne su içerek başla!',            color: '#a5b4fc' }

  return (
    <main className="bg-mesh" style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <Toast />

      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(37,99,235,0.2),transparent)', top: -100, left: -100 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(13,148,136,0.15),transparent)', bottom: 100, right: -80 }} />
      <div className="orb" style={{ width: 200, height: 200, background: 'radial-gradient(circle,rgba(99,102,241,0.1),transparent)', top: '40%', left: '60%' }} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,15,46,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,179,237,0.12)',
        padding: '14px 16px',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#2563eb,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: 'white',
              boxShadow: '0 0 16px rgba(37,99,235,0.4)',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                Merhaba,{' '}
                <span style={{
                  background: 'linear-gradient(90deg,#63b3ed,#4fd1c7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.5)', marginTop: 1 }}>
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/setup')}
              style={{
                fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,179,237,0.2)',
                color: 'rgba(147,197,253,0.8)', cursor: 'pointer',
              }}
            >⚙️ Ayarlar</button>
            <button
              onClick={handleLogout}
              style={{
                fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5', cursor: 'pointer',
              }}
            >Çıkış</button>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: 520, margin: '0 auto', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>

        {nextReminder && (
          <div style={{
            borderRadius: 20, padding: '16px 20px',
            background: 'linear-gradient(135deg,rgba(37,99,235,0.25),rgba(13,148,136,0.2))',
            border: '1px solid rgba(99,179,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 0 32px rgba(37,99,235,0.15)',
            backdropFilter: 'blur(16px)',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(147,197,253,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Sonraki Hatırlatıcı
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#93c5fd' }}>
                {new Date(nextReminder.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.5)', marginTop: 2 }}>
                {nextReminder.title}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 36, fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(135deg,#63b3ed,#4fd1c7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {minutesLeft}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.5)', marginTop: 2 }}>dakika sonra</div>
            </div>
          </div>
        )}

        <WaterProgress consumed={consumed} goal={goal} />

        <div className="glass" style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.5)', letterSpacing: '0.08em', marginBottom: 8 }}>
            Her içişte <span style={{ color: '#63b3ed', fontWeight: 700 }}>{settings?.amountPerDrinkMl}ml</span> sayılır
          </div>
          <DrinkButton onDrink={handleDrink} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l2 2 4-4"/></svg>,
              label: 'İçiş', value: consumedCount, unit: 'kez', color: '#63b3ed',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
              label: 'Hedef', value: `%${percent}`, unit: '', color: percent >= 100 ? '#4fd1c7' : percent >= 50 ? '#63b3ed' : '#a5b4fc',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
              label: 'Kalan', value: Math.max(goal - consumed, 0), unit: 'ml', color: '#4fd1c7',
            },
          ].map((stat) => (
            <div key={stat.label} style={{
              borderRadius: 18, padding: '16px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(99,179,237,0.12)',
              textAlign: 'center', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ color: stat.color, display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                {stat.value}
                {stat.unit && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 2, color: 'rgba(147,197,253,0.5)' }}>{stat.unit}</span>}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(147,197,253,0.4)', marginTop: 6, letterSpacing: '0.06em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          borderRadius: 20, padding: '18px 20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(99,179,237,0.12)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            {mot.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: mot.color }}>{mot.text}</div>
            <div style={{ fontSize: 11, color: 'rgba(147,197,253,0.4)', marginTop: 3 }}>
              Bugün {consumedCount} kez su içtin ✦ {consumed}ml tamamlandı
            </div>
          </div>
        </div>

        <ReminderSchedule schedule={schedule} consumedCount={consumedCount} />
      </div>
    </main>
  )
}