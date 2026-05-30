import { createClient } from '@/lib/supabase/server'
import ParticipantTable from '@/components/ParticipantTable'
import FinishTimeUpload from '@/components/FinishTimeUpload'
import type { Participant, ParticipantStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

const SUMMARY: { key: ParticipantStatus; label: string; color: string }[] = [
  { key: 'registered',    label: 'Registered',    color: 'text-gray-700 bg-gray-100'      },
  { key: 'approved',      label: 'Approved',       color: 'text-orange-700 bg-orange-100'  },
  { key: 'confirmed',     label: 'Confirmed',      color: 'text-blue-700 bg-blue-100'      },
  { key: 'bib_collected', label: 'BIB Collected',  color: 'text-yellow-800 bg-yellow-100'  },
  { key: 'certified',     label: 'Certified',      color: 'text-green-700 bg-green-100'    },
]

export default async function ParticipantsPage() {
  const supabase = await createClient()
  const { data: participants, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load participants: {error.message}
      </div>
    )
  }

  const rows = (participants ?? []) as Participant[]
  const counts = rows.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Participants</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve registrations, assign BIB numbers, and upload finish times
          </p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
          {rows.length} total
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6" data-testid="status-summary">
        {SUMMARY.map(s => (
          <div
            key={s.key}
            data-testid={`summary-${s.key}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <p className="text-3xl font-bold text-gray-800">{counts[s.key] ?? 0}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bulk finish-time CSV upload */}
      <FinishTimeUpload />

      {/* Registrations table */}
      <ParticipantTable participants={rows} />
    </div>
  )
}
