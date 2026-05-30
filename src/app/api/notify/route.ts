import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Stage-based email notifications via Resend.
 *
 * POST /api/notify  { participantId: string, status: string }
 *
 * Looks up the participant server-side, then sends the appropriate email.
 * The Resend key is read only here (server) and never reaches the client.
 * Always returns 200 — email failures must never block a status update.
 */

const RACE_NAME = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

type EmailContent = { subject: string; html: string }

function buildEmail(
  status: string,
  name: string,
  bib: number | null,
  statusUrl: string
): EmailContent | null {
  const wrap = (heading: string, body: string) => `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
      <h1 style="color:#4338ca;font-size:22px;margin:0 0 4px">🏃 ${RACE_NAME}</h1>
      <h2 style="font-size:18px;margin:16px 0 8px">${heading}</h2>
      ${body}
      <p style="margin-top:24px"><a href="${statusUrl}" style="background:#4f46e5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;display:inline-block">Track my status</a></p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Marathon Management Platform</p>
    </div>`

  switch (status) {
    case 'registered':
      return {
        subject: `Welcome to ${RACE_NAME}, ${name}!`,
        html: wrap(
          `Welcome aboard, ${name}!`,
          `<p>Thanks for registering for <strong>${RACE_NAME}</strong>. Your registration has been received.</p>
           <p>Our team will review it and assign your BIB number shortly — you'll get an email when that happens.</p>`
        ),
      }
    case 'approved':
      return {
        subject: `You're approved! BIB #${bib} — ${RACE_NAME}`,
        html: wrap(
          `You're approved, ${name}! 🎉`,
          `<p>Great news — you've been approved for <strong>${RACE_NAME}</strong>.</p>
           <p style="font-size:16px">Your BIB number is
             <strong style="font-family:monospace;font-size:24px;color:#4338ca">#${bib}</strong>
           </p>
           <p>Please <strong>confirm your participation</strong> on your status page to secure your spot.</p>`
        ),
      }
    case 'bib_collected':
      return {
        subject: `BIB #${bib} collected — ${RACE_NAME}`,
        html: wrap(
          `You're checked in, ${name}! 🏁`,
          `<p>Your BIB <strong style="font-family:monospace">#${bib}</strong> has been collected at the race-day station.</p>
           <p>You're all set for the race. Best of luck out there!</p>`
        ),
      }
    case 'certified':
      return {
        subject: `🏅 You finished! Certificate ready — ${RACE_NAME}`,
        html: wrap(
          `Congratulations, ${name}! 🏅`,
          `<p>You've officially completed <strong>${RACE_NAME}</strong> — you're certified!</p>
           <p>Your finisher certificate is ready. Open your status page to view and download it.</p>`
        ),
      }
    default:
      // 'confirmed' has no email (WhatsApp invite is shown in-app)
      return null
  }
}

export async function POST(req: Request) {
  try {
    const { participantId, status } = await req.json().catch(() => ({}))
    if (!participantId || !status) {
      return NextResponse.json({ ok: false, skipped: 'bad-request' })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Graceful: email disabled, never block the flow
      return NextResponse.json({ ok: false, skipped: 'no-api-key' })
    }

    // Server-side lookup (anon key — migration 002 grants anon SELECT)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: p } = await supabase
      .from('participants')
      .select('name, email, bib_number')
      .eq('id', participantId)
      .single()

    if (!p?.email) {
      return NextResponse.json({ ok: false, skipped: 'no-recipient' })
    }

    const statusUrl = `${new URL(req.url).origin}/status`
    const content = buildEmail(status, p.name, p.bib_number, statusUrl)
    if (!content) {
      return NextResponse.json({ ok: true, skipped: 'no-email-for-status' })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${RACE_NAME} <${FROM}>`,
        to: p.email,
        subject: content.subject,
        html: content.html,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('Resend error:', res.status, detail)
      return NextResponse.json({ ok: false, error: 'resend-failed' })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Never throw — emails are best-effort
    console.error('notify route error:', err)
    return NextResponse.json({ ok: false, error: 'exception' })
  }
}
