'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Certificate from './Certificate'
import type { Participant } from '@/lib/types'

export default function BibScanner() {
  const supabase = createClient()
  const [bib, setBib] = useState('')
  const [loading, setLoading] = useState(false)
  const [certParticipant, setCertParticipant] = useState<Participant | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const resetInput = () => {
    setBib('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    const bibNum = parseInt(bib.trim())
    if (!bibNum || isNaN(bibNum)) {
      toast.error('Please enter a valid BIB number.')
      return
    }

    setLoading(true)
    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('bib_number', bibNum)
        .single()

      if (error || !participant) {
        toast.error(`BIB #${bibNum} not found.`)
        resetInput()
        return
      }

      if (participant.status === 'confirmed') {
        const { error: updateError } = await supabase
          .from('participants')
          .update({ status: 'bib_collected' })
          .eq('id', participant.id)

        if (updateError) {
          toast.error('Update failed: ' + updateError.message)
        } else {
          toast.success(`✅ BIB #${bibNum} collected — ${participant.name}`)
        }
        resetInput()

      } else if (participant.status === 'bib_collected') {
        const certifiedAt = new Date().toISOString()
        const { error: updateError } = await supabase
          .from('participants')
          .update({ status: 'certified', certified_at: certifiedAt })
          .eq('id', participant.id)

        if (updateError) {
          toast.error('Certification failed: ' + updateError.message)
          resetInput()
        } else {
          toast.success(`🏅 ${participant.name} is certified!`)
          setCertParticipant({ ...participant, status: 'certified', certified_at: certifiedAt } as Participant)
          resetInput()
        }

      } else if (participant.status === 'certified') {
        toast(`${participant.name} is already certified.`, { icon: '🏅' })
        resetInput()

      } else {
        toast.error(
          `BIB #${bibNum}: status is "${participant.status}" — must be confirmed before race-day check-in.`
        )
        resetInput()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleScan}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        data-testid="bib-scanner-form"
      >
        <label className="block text-sm font-medium text-gray-600 mb-3 text-center">
          Enter BIB Number
        </label>
        <input
          data-testid="bib-input"
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={bib}
          onChange={e => setBib(e.target.value)}
          placeholder="1001"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-5 text-5xl font-mono text-center focus:outline-none focus:border-indigo-500 mb-4 tracking-widest"
        />
        <button
          data-testid="bib-scan-button"
          type="submit"
          disabled={loading || !bib.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? 'Processing…' : 'Confirm BIB'}
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-center text-gray-400">
          <div className="bg-blue-50 rounded-lg p-2">
            <span className="font-semibold text-blue-600">Confirmed</span>
            <br />→ marks BIB Collected
          </div>
          <div className="bg-yellow-50 rounded-lg p-2">
            <span className="font-semibold text-yellow-600">BIB Collected</span>
            <br />→ Certified + certificate
          </div>
        </div>
      </form>

      {certParticipant && (
        <Certificate
          participant={certParticipant}
          onClose={() => setCertParticipant(null)}
        />
      )}
    </div>
  )
}
