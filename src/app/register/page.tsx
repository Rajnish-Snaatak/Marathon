'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL'] as const

const EMPTY_FORM = { name: '', email: '', phone: '', age: '', tshirt_size: 'M' }

export default function RegisterPage() {
  const supabase = createClient()
  const raceName = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('participants').insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        age: form.age ? parseInt(form.age) : null,
        tshirt_size: form.tshirt_size,
        status: 'registered',
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already registered.')
        } else {
          toast.error('Registration failed. Please try again.')
          console.error(error)
        }
      } else {
        toast.success('Registered! Check in on race day with your BIB number.')
        setForm(EMPTY_FORM)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏃</div>
          <h1 className="text-3xl font-bold text-indigo-700">{raceName}</h1>
          <p className="text-gray-500 mt-1">Participant Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="registration-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="register-name-input"
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="register-email-input"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              data-testid="register-phone-input"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 0100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                data-testid="register-age-input"
                type="number"
                name="age"
                min="10"
                max="100"
                value={form.age}
                onChange={handleChange}
                placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                T-Shirt <span className="text-red-500">*</span>
              </label>
              <select
                data-testid="register-tshirt-select"
                name="tshirt_size"
                required
                value={form.tshirt_size}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TSHIRT_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            data-testid="register-submit-button"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Registering…' : 'Register Now'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already registered?{' '}
          <a href="/status" className="text-indigo-500 hover:underline">
            Track your journey →
          </a>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Admin?{' '}
          <a href="/admin/login" className="text-indigo-500 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  )
}
