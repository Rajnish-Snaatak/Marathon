'use client'

import { useRef } from 'react'
import type { Participant } from '@/lib/types'

interface CertificateProps {
  participant: Participant
  onClose: () => void
}

export default function Certificate({ participant, onClose }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null)
  const raceName = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
  const completionDate = participant.certified_at
    ? new Date(participant.certified_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleDownload = async () => {
    if (!certRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `certificate-bib-${participant.bib_number}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      window.print()
    }
  }

  return (
    <div className="space-y-4" data-testid="certificate-wrapper">
      {/* Printable / capturable certificate */}
      <div
        ref={certRef}
        data-testid="certificate-container"
        className="bg-white border-[6px] border-double border-indigo-300 rounded-2xl p-10 text-center shadow-md"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <p className="text-indigo-400 uppercase tracking-[0.25em] text-xs font-sans mb-3">
          Certificate of Completion
        </p>
        <h2 className="text-2xl font-bold text-indigo-800 mb-5">{raceName}</h2>
        <div className="border-t border-b border-indigo-100 py-5 my-4">
          <p className="text-gray-400 text-sm mb-1">This certifies that</p>
          <p className="text-4xl font-bold text-gray-800 leading-tight">{participant.name}</p>
          <p className="text-gray-400 text-sm mt-2">
            BIB <span className="font-bold text-gray-600 font-mono">#{participant.bib_number}</span>
            {participant.distance && (
              <span className="ml-3 text-gray-400">· {participant.distance}</span>
            )}
          </p>
        </div>
        <p className="text-gray-500 text-sm">successfully completed the race on</p>
        <p className="text-xl font-semibold text-gray-700 mt-1">{completionDate}</p>
        <div className="mt-8 text-[10px] text-gray-300 font-sans">
          Marathon Management Platform
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          data-testid="certificate-download-btn"
          onClick={handleDownload}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          ⬇ Download PNG
        </button>
        <button
          data-testid="certificate-close-btn"
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
