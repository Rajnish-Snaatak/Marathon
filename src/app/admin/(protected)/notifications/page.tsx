'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { ParticipantStatus } from '@/lib/types'

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL

const AUDIENCES: { key: 'all' | ParticipantStatus; label: string }[] = [
  { key: 'all',           label: 'All participants' },
  { key: 'registered',    label: 'Registered' },
  { key: 'approved',      label: 'Approved' },
  { key: 'confirmed',     label: 'Confirmed' },
  { key: 'bib_collected', label: 'BIB Collected' },
  { key: 'certified',     label: 'Certified' },
]

interface BroadcastResult {
  sent: number
  failed: number
  failures?: string[]
  skipped?: string
}

export default function NotificationsPage() {
  const supabase = createClient()
  const [statuses, setStatuses] = useState<string[]>([]) // one entry per participant w/ email
  const [audience, setAudience] = useState<'all' | ParticipantStatus>('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<BroadcastResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Load participant statuses once for live recipient counts
  useEffect(() => {
    supabase
      .from('participants')
      .select('status, email')
      .then(({ data }) => {
        setStatuses((data ?? []).filter(p => p.email).map(p => p.status))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const recipientCount = useMemo(() => {
    if (audience === 'all') return statuses.length
    return statuses.filter(s => s === audience).length
  }, [audience, statuses])

  // ── Email broadcast ─────────────────────────────────────────────────────────
  const sendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required.')
      return
    }
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, status: audience }),
      })
      const data = await res.json().catch(() => ({}))

      if (data.skipped === 'no-api-key') {
        toast.error('Email is not configured (RESEND_API_KEY missing).')
        setResult({ sent: 0, failed: 0, skipped: 'no-api-key' })
        return
      }
      if (!data.ok) {
        toast.error('Broadcast failed. Please try again.')
        return
      }
      setResult({ sent: data.sent, failed: data.failed, failures: data.failures })
      toast.success(`Sent ${data.sent} email${data.sent === 1 ? '' : 's'}${data.failed ? `, ${data.failed} failed` : ''}`)
    } catch {
      toast.error('Network error sending broadcast.')
    } finally {
      setSending(false)
    }
  }

  // ── WhatsApp helpers ────────────────────────────────────────────────────────
  const waShareText = `${subject ? subject + '\n\n' : ''}${body}${WHATSAPP_URL ? `\n\nJoin our group: ${WHATSAPP_URL}` : ''}`
  const waMeLink = `https://wa.me/?text=${encodeURIComponent(waShareText || (WHATSAPP_URL ?? ''))}`

  const copyInvite = async () => {
    if (!WHATSAPP_URL) return
    try {
      await navigator.clipboard.writeText(WHATSAPP_URL)
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed — select and copy manually.')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notification Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Compose a message and broadcast it to participants
        </p>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
          <div className="flex items-center gap-3">
            <select
              data-testid="audience-select"
              value={audience}
              onChange={e => setAudience(e.target.value as 'all' | ParticipantStatus)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {AUDIENCES.map(a => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
            <span
              data-testid="recipient-count"
              className="text-sm bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-full"
            >
              {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            data-testid="broadcast-subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Race day instructions"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            data-testid="broadcast-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            placeholder="Write your announcement here…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Email send */}
        <button
          data-testid="send-email-button"
          onClick={sendEmail}
          disabled={sending || recipientCount === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {sending ? 'Sending…' : `📧 Email ${recipientCount} recipient${recipientCount === 1 ? '' : 's'}`}
        </button>

        {result && (
          <div className="border-t border-gray-100 pt-3 text-sm" data-testid="broadcast-result">
            {result.skipped === 'no-api-key' ? (
              <p className="text-amber-600">Email channel unavailable — RESEND_API_KEY is not set.</p>
            ) : (
              <>
                <p>
                  <span className="font-semibold text-green-600">{result.sent} sent</span>
                  {result.failed > 0 && (
                    <span className="text-red-500 font-semibold"> · {result.failed} failed</span>
                  )}
                </p>
                {result.failures && result.failures.length > 0 && (
                  <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {result.failures.map((f, i) => (
                      <li key={i} className="text-xs text-red-500">{f}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp channel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">💬 WhatsApp</h2>
        <p className="text-xs text-gray-400 mb-3">
          Full WhatsApp Business API is out of scope — share the group invite or open a
          pre-filled message to forward.
        </p>

        {WHATSAPP_URL ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={WHATSAPP_URL}
                data-testid="whatsapp-invite-url"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600"
              />
              <button
                data-testid="copy-invite-button"
                onClick={copyInvite}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <a
              data-testid="wame-link"
              href={waMeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Open in WhatsApp to share →
            </a>
          </div>
        ) : (
          <p className="text-sm text-amber-600">
            Set <code className="bg-amber-50 px-1 rounded">NEXT_PUBLIC_WHATSAPP_INVITE_URL</code> to enable this channel.
          </p>
        )}
      </div>
    </div>
  )
}
