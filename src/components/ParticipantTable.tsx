'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { notify } from '@/lib/notify'
import toast from 'react-hot-toast'
import StatusBadge from './StatusBadge'
import type { Participant } from '@/lib/types'

export default function ParticipantTable({ participants }: { participants: Participant[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.bib_number?.toString() ?? '').includes(search)
  )

  const handleApproveBib = async (participant: Participant) => {
    setLoadingId(participant.id)
    try {
      const maxBib = participants.reduce(
        (max, p) => Math.max(max, p.bib_number ?? 1000),
        1000
      )
      const newBib = maxBib + 1

      const { error } = await supabase
        .from('participants')
        .update({
          status: 'approved',
          bib_number: newBib,
          approved_at: new Date().toISOString(),
        })
        .eq('id', participant.id)

      if (error) {
        toast.error('Failed to assign BIB: ' + error.message)
      } else {
        toast.success(`BIB #${newBib} assigned — ${participant.name} approved. Awaiting participant confirmation.`)
        notify(participant.id, 'approved')
        router.refresh()
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <input
          data-testid="participant-search-input"
          type="search"
          placeholder="Search by name, email, or BIB…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="participant-table">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">BIB #</th>
              <th className="px-4 py-3 text-left">Distance</th>
              <th className="px-4 py-3 text-left">T-Shirt</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Registered</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  {search ? 'No participants match your search.' : 'No participants yet.'}
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.email}</td>
                  <td className="px-4 py-3 font-mono text-gray-700 font-semibold">
                    {p.bib_number ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.distance ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.tshirt_size ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'registered' && (
                      <button
                        data-testid={`approve-bib-button-${p.id}`}
                        onClick={() => handleApproveBib(p)}
                        disabled={loadingId === p.id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {loadingId === p.id ? 'Approving…' : 'Approve + BIB'}
                      </button>
                    )}
                    {p.status === 'approved' && (
                      <span className="text-xs text-orange-500 italic">
                        Awaiting confirmation
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
