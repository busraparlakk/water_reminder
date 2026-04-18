// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllUsers, saveUser, setCurrentUserId, getUserByEmail } from '@/lib/storage'
import { User } from '@/types'

type Mode = 'login' | 'register'

function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password))
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 500))

    if (mode === 'register') {
      const exists = getUserByEmail(form.email)
      if (exists) {
        setError('Bu e-posta zaten kayıtlı.')
        setLoading(false)
        return
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name: form.name,
        email: form.email,
        passwordHash: hashPassword(form.password),
        createdAt: new Date().toISOString(),
      }
      saveUser(newUser)
      setCurrentUserId(newUser.id)
      router.push('/setup')
    } else {
      const user = getUserByEmail(form.email)
      if (!user || user.passwordHash !== hashPassword(form.password)) {
        setError('E-posta veya şifre hatalı.')
        setLoading(false)
        return
      }
      setCurrentUserId(user.id)
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="bg-mesh min-h-screen flex items-center justify-center px-4 overflow-hidden relative">

      {/* Arka plan orb'ları */}
      <div className="orb w-80 h-80 bg-blue-600/20 -top-20 -left-20 animate-float" />
      <div className="orb w-64 h-64 bg-teal-500/15 bottom-10 -right-16"
        style={{ animationDelay: '1.5s' }} />
      <div className="orb w-48 h-48 bg-indigo-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div
        className={`w-full max-w-md relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4 animate-glow">
              <span style={{ fontSize: 36 }}>💧</span>
            </div>
            {/* Orbit damlalar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#63b3ed','#4fd1c7','#818cf8'][i],
                    animation: `orbit 4s linear infinite`,
                    animationDelay: `${-i * 1.33}s`,
                    top: '50%', left: '50%',
                    marginTop: -4, marginLeft: -4,
                  }}
                />
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-shimmer">Su Hatırlatıcı</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Günlük hedefe ulaşmanın en kolay yolu
          </p>
        </div>

        {/* Kart */}
        <div className="glass-strong p-8">

          {/* Tab */}
          <div className="flex rounded-xl p-1 mb-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                style={
                  mode === m
                    ? {
                        background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                        color: 'white',
                        boxShadow: '0 0 16px rgba(37,99,235,0.4)',
                      }
                    : { color: 'var(--text-muted)' }
                }
              >
                {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-up">
                <label className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}>
                  Ad Soyad
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Adın Soyadın"
                  className="input-glass"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}>
                E-posta
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@mail.com"
                className="input-glass"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}>
                Şifre
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
                className="input-glass"
              />
            </div>

            {error && (
              <div className="animate-fade-up rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-4 text-sm font-bold mt-2"
              style={{ borderRadius: 14 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                    style={{ animation: 'spin 0.8s linear infinite' }} />
                  Yükleniyor...
                </span>
              ) : mode === 'login' ? '🚀 Giriş Yap' : '✨ Hesap Oluştur'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          🔒 Tüm veriler yalnızca cihazında saklanır
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}