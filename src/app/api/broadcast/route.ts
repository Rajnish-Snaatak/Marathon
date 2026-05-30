import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Manual organizer broadcast — emails a composed message to an audience.
 *
 * POST /api/broadcast  { subject, body, status }
 *   status: 'all' | registered | approved | confirmed | bib_collected | certified
 *
 * Recipients are looked up server-side; RESEND_API_KEY never reaches the client.
 * Fails gracefully — a missing key or per-recipient error never throws.
 */

const RACE_NAME = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

const VALID_STATUS = new Set([
  'all', 'registered', 'approved', 'confirmed', 'bib_collected', 'certified',
])

function emailHtml(subject: string, body: string): string {
  const safeBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
      <h1 style="color:#4338ca;font-size:20px;margin:0 0 16px">🏃 ${RACE_NAME}</h1>
      <div style="font-size:15px;line-height:1.6">${safeBody}</div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">${RACE_NAME} · Marathon Management Platform</p>
    </div>`
}

export async function POST(req: Request) {
  try {
    const { subject, body, status } = await req.json().catch(() => ({}))

    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ ok: false, error: 'subject-and-body-required' })
    }
    const audience = VALID_STATUS.has(status) ? status : 'all'

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ok: false, skipped: 'no-api-key', sent: 0, failed: 0 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let q = supabase.from('participants').select('name, email')
    if (audience !== 'all') q = q.eq('status', audience)
    const { data: recipients, error } = await q

    if (error) {
      return NextResponse.json({ ok: false, error: 'lookup-failed', detail: error.message })
    }

    const valid = (recipients ?? []).filter(r => r.email)
    if (valid.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, failed: 0, failures: [] })
    }

    const html = emailHtml(subject, body)
    const failures: string[] = []
    let sent = 0

    // Sequential send — small audiences for a hackathon; keeps under rate limits
    for (const r of valid) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${RACE_NAME} <${FROM}>`,
            to: r.email,
            subject: subject.trim(),
            html,
          }),
        })
        if (res.ok) {
          sent++
        } else {
          failures.push(`${r.email}: ${res.status}`)
        }
      } catch {
        failures.push(`${r.email}: network error`)
      }
    }

    return NextResponse.json({ ok: true, sent, failed: failures.length, failures })
  } catch (err) {
    console.error('broadcast route error:', err)
    return NextResponse.json({ ok: false, error: 'exception' })
  }
}
