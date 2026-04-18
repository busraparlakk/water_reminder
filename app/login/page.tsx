// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllUsers, saveUser, setCurrentUserId, getUserByEmail } from '@/lib/storage'
import { User } from '@/types'

type Mode = 'login' | 'register'

function hashPassword(password: string): string {
  // Basit hash — production'da bcrypt kullanılır
  return btoa(encodeURIComponent(password))
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    await new Promise((r) => setTimeout(r, 400)) // UX için küçük bekleme

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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">💧</div>
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">Su Hatırlatıcı</h1>
          <p className="text-slate-500 mt-1 text-sm">Günlük su hedefine ulaş</p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">

          {/* Tab */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Adın Soyadın"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-slate-800 placeholder-slate-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-posta
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@mail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-slate-800 placeholder-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-slate-800 placeholder-slate-300"
              />
            </div>

            {/* Hata mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-200"
            >
              {loading
                ? '⏳ Bekle...'
                : mode === 'login'
                ? 'Giriş Yap'
                : 'Hesap Oluştur'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Tüm veriler cihazında saklanır. Sunucuya gönderilmez.
        </p>
      </div>
    </main>
  )
}