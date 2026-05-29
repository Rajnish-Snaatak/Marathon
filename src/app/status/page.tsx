'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Certificate from '@/components/Certificate'
import type { Participant, ParticipantStatus } from '@/lib/types'

// ── Stage definitions ────────────────────────────────────────────────────────

const STAGES: { key: ParticipantStatus; label: string; description: string }[] = [
  { key: 'registered',    label: 'Registered',    description: 'Registration received'     },
  { key: 'approved',      label: 'Approved',      description: 'BIB number assigned'       },
  { key: 'confirmed',     label: 'Confirmed',     description: 'Participation confirmed'    },
  { key: 'bib_collected', label: 'BIB Collected', description: 'Checked in on race day'    },
  { key: 'certified',     label: 'Certified',     description: 'Race completed!'            },
]

const STATUS_INDEX: Record<ParticipantStatus, number> = {
  registered: 0, approved: 1, confirmed: 2, bib_collected: 3, certified: 4,
}

// ── Stage tracker ────────────────────────────────────────────────────────────

function StageTracker({ status }: { status: ParticipantStatus }) {
  const current = STATUS_INDEX[status]

  return (
    <div className="w-full px-2 py-4">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start">
        {STAGES.map((stage, i) => {
          const done    = i < current
          const active  = i === current
          const upcoming = i > current

          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (left side, skip first) */}
              {i > 0 && (
                <div
                  className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-0.5
                    ${i <= current ? 'bg-indigo-500' : 'bg-gray-200'}`}
                />
              )}
              {/* Circle */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done    ? 'bg-indigo-600 text-white'                                  : ''}
                ${active  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110' : ''}
                ${upcoming? 'bg-gray-100 text-gray-400 border-2 border-gray-200'        : ''}`}
              >
                {done ? '✓' : i + 1}
              </div>
              {/* Label */}
              <p className={`mt-2 text-xs text-center leading-tight
                ${active   ? 'font-bold text-indigo-700' : ''}
                ${done     ? 'text-indigo-400'           : ''}
                ${upcoming ? 'text-gray-400'             : ''}`}
              >
                {stage.label}
              </p>
              {/* Description (active only) */}
              {active && (
                <p className="mt-0.5 text-[10px] text-indigo-400 text-center">
                  {stage.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="sm:hidden space-y-1">
        {STAGES.map((stage, i) => {
          const done    = i < current
          const active  = i === current
          const upcoming = i > current

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${done    ? 'bg-indigo-600 text-white'                           : ''}
                ${active  ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'    : ''}
                ${upcoming? 'bg-gray-100 text-gray-400 border border-gray-200'   : ''}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div>
                <p className={`text-sm font-medium
                  ${active   ? 'text-indigo-700' : ''}
                  ${done     ? 'text-indigo-400' : ''}
                  ${upcoming ? 'text-gray-400'   : ''}`}
                >
                  {stage.label}
                  {active && <span className="ml-2 text-xs font-normal text-indigo-400">← current</span>}
                </p>
                {active && (
                  <p className="text-xs text-gray-400">{stage.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const supabase = createClient()
  const raceName = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'

  const [query, setQuery]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [confirming, setConfirming]   = useState(false)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [showCert, setShowCert]       = useState(true)
  const [notFound, setNotFound]       = useState(false)

  // ── Lookup ────────────────────────────────────────────────────────────────

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setNotFound(false)
    setParticipant(null)
    setShowCert(true)

    try {
      const isNumeric = /^\d+$/.test(q)
      const { data, error } = isNumeric
        ? await supabase.from('participants').select('*').eq('bib_number', parseInt(q)).single()
        : await supabase.from('participants').select('*').eq('email', q.toLowerCase()).single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setParticipant(data as Participant)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Self-confirm ──────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!participant) return
    setConfirming(true)
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('participants')
        .update({ status: 'confirmed', confirmed_at: now })
        .eq('id', participant.id)

      if (error) {
        toast.error('Confirmation failed: ' + error.message)
      } else {
        toast.success('You\'re confirmed! See you on race day 🎉')
        setParticipant({ ...participant, status: 'confirmed', confirmed_at: now })
      }
    } finally {
      setConfirming(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🏃</div>
          <h1 className="text-3xl font-bold text-indigo-700">{raceName}</h1>
          <p className="text-gray-500 mt-1">Track Your Journey</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleLookup} className="flex gap-2 mb-6" data-testid="status-lookup-form">
          <input
            data-testid="status-lookup-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter your email or BIB number…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
          />
          <button
            data-testid="status-lookup-button"
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? '…' : 'Find'}
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 text-sm mb-4">
            No participant found for <strong>{query}</strong>.
            <br />
            <a href="/register" className="text-indigo-500 hover:underline mt-1 inline-block">
              Register here →
            </a>
          </div>
        )}

        {/* Participant card */}
        {participant && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" data-testid="participant-status-card">

            {/* Identity */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{participant.name}</h2>
                  <p className="text-sm text-gray-400">{participant.email}</p>
                  {participant.distance && (
                    <span className="inline-block mt-1 text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {participant.distance}
                    </span>
                  )}
                </div>
                {/* BIB badge — visible once approved */}
                {participant.bib_number && STATUS_INDEX[participant.status] >= 1 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-center" data-testid="bib-display">
                    <p className="text-xs text-indigo-400 font-medium">BIB</p>
                    <p className="text-3xl font-bold font-mono text-indigo-700">#{participant.bib_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stage tracker */}
            <div className="px-4 border-t border-gray-100 pt-2">
              <StageTracker status={participant.status} />
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">

              {/* Confirm button — only when approved */}
              {participant.status === 'approved' && (
                <button
                  data-testid="self-confirm-button"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {confirming ? 'Confirming…' : '✅ Confirm My Participation'}
                </button>
              )}

              {/* Certificate — when certified */}
              {participant.status === 'certified' && (
                showCert ? (
                  <Certificate
                    participant={participant}
                    onClose={() => setShowCert(false)}
                  />
                ) : (
                  <button
                    data-testid="show-cert-button"
                    onClick={() => setShowCert(true)}
                    className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold py-3 rounded-xl transition-colors"
                  >
                    🏅 View My Certificate
                  </button>
                )
              )}

              {/* Race day hint */}
              {participant.status === 'confirmed' && (
                <p className="text-center text-sm text-gray-400 bg-blue-50 rounded-xl py-3 px-4">
                  ✅ You're all set! Head to the race day station on event day.
                </p>
              )}

              {participant.status === 'registered' && (
                <p className="text-center text-sm text-gray-400 bg-gray-50 rounded-xl py-3 px-4">
                  ⏳ Your registration is pending admin approval.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="text-center mt-6 space-x-4 text-xs text-gray-400">
          <a href="/register" className="hover:text-indigo-500">Register</a>
          <span>·</span>
          <a href="/admin/login" className="hover:text-indigo-500">Admin</a>
        </div>

      </div>
    </div>
  )
}
