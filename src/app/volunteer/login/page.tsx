'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function VolunteerLoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error || !data.user) {
      toast.error('Invalid email or password.')
      setLoading(false)
      return
    }

    // Route by role stored in user_metadata
    const role = (data.user.user_metadata as { role?: string } | null)?.role
    if (role === 'admin') {
      router.push('/admin/participants')
    } else {
      router.push('/volunteer/scan')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📷</div>
          <h1 className="text-2xl font-bold text-gray-800">Volunteer Login</h1>
          <p className="text-gray-500 text-sm mt-1">
            {process.env.NEXT_PUBLIC_RACE_NAME ?? 'Marathon Management'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="volunteer-login-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              data-testid="volunteer-login-email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              data-testid="volunteer-login-password"
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            data-testid="volunteer-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Admin?{' '}
          <a href="/admin/login" className="text-indigo-500 hover:underline">
            Admin login →
          </a>
        </p>
      </div>
    </div>
  )
}
