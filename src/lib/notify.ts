import type { ParticipantStatus } from './types'

/**
 * Fire-and-forget email notification trigger.
 * Calls the server route which sends the right email via Resend.
 * Never throws and never blocks — email is best-effort; the in-app
 * toast and the status update are the source of truth.
 */
export function notify(participantId: string, status: ParticipantStatus) {
  try {
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, status }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* swallow — notifications must never break the flow */
  }
}
