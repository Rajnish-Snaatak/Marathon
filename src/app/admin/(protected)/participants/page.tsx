import { createClient } from '@/lib/supabase/server'
import ParticipantTable from '@/components/ParticipantTable'

export const dynamic = 'force-dynamic'

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Participants</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve registrations and assign BIB numbers
          </p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
          {participants?.length ?? 0} total
        </span>
      </div>
      <ParticipantTable participants={participants ?? []} />
    </div>
  )
}
