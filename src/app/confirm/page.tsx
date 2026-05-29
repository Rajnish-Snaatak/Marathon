'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ConfirmPage() {
  const supabase = createClient()
  const raceName = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bibNumber, setBibNumber] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .select('id, name, status, bib_number')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (error || !participant) {
        toast.error('No registration found for this email.')
        return
      }

      if (participant.status === 'confirmed') {
        toast('You have already confirmed your spot!', { icon: '✅' })
        return
      }

      if (participant.status === 'certified') {
        toast('You are already a certified finisher!', { icon: '🏅' })
        return
      }

      if (participant.status !== 'approved') {
        toast.error(`Your registration is currently "${participant.status}". Only approved participants can confirm.`)
        return
      }

      const { error: updateError } = await supabase
        .from('participants')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', participant.id)

      if (updateError) {
        toast.error('Confirmation failed. Please try again.')
      } else {
        setBibNumber(participant.bib_number)
        setConfirmed(true)
        toast.success(`${participant.name}, your spot is confirmed!`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏃</div>
          <h1 className="text-3xl font-bold text-indigo-700">{raceName}</h1>
          <p className="text-gray-500 mt-1">Confirm Your Spot</p>
        </div>

        {confirmed ? (
          <div className="text-center space-y-4" data-testid="confirmation-success">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">You're confirmed!</h2>
            {bibNumber && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-gray-500 text-sm">Your BIB number</p>
                <p className="text-5xl font-bold font-mono text-indigo-700">#{bibNumber}</p>
              </div>
            )}
            <p className="text-gray-500 text-sm">
              Bring this BIB number to the race. See you on the start line!
            </p>
            <a
              href="/register"
              className="inline-block text-indigo-500 hover:underline text-sm"
            >
              Register someone else →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="confirm-form">
            <p className="text-sm text-gray-600 text-center">
              Enter the email you registered with to confirm your participation.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                data-testid="confirm-email-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              data-testid="confirm-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Confirming…' : 'Confirm My Spot'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Not registered yet?{' '}
          <a href="/register" className="text-indigo-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
}
