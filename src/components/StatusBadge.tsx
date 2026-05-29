import type { ParticipantStatus } from '@/lib/types'

const STYLES: Record<ParticipantStatus, string> = {
  registered:    'bg-gray-100 text-gray-700',
  confirmed:     'bg-blue-100 text-blue-700',
  bib_collected: 'bg-yellow-100 text-yellow-800',
  certified:     'bg-green-100 text-green-700',
}

const LABELS: Record<ParticipantStatus, string> = {
  registered:    'Registered',
  confirmed:     'Confirmed',
  bib_collected: 'BIB Collected',
  certified:     'Certified ✓',
}

export default function StatusBadge({ status }: { status: ParticipantStatus }) {
  return (
    <span
      data-testid="status-badge"
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
