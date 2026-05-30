'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { notify } from '@/lib/notify'
import toast from 'react-hot-toast'

interface RowResult {
  line: number
  bib: string
  reason: string
}

interface UploadSummary {
  success: number
  failures: RowResult[]
}

// Parse a CSV line, tolerating simple quoted values.
function splitCsvLine(line: string): string[] {
  return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
}

export default function FinishTimeUpload() {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [summary, setSummary] = useState<UploadSummary | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setSummary(null)

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) {
        toast.error('CSV is empty or has no data rows.')
        return
      }

      // Locate columns from the header
      const header = splitCsvLine(lines[0]).map(h => h.toLowerCase())
      const bibIdx = header.findIndex(h => h.includes('bib'))
      const timeIdx = header.findIndex(h => h.includes('finish') || h.includes('time'))

      if (bibIdx === -1 || timeIdx === -1) {
        toast.error('CSV must have a BIB column and a finish-time column.')
        return
      }

      const failures: RowResult[] = []
      let success = 0

      for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i])
        const bibRaw = cols[bibIdx] ?? ''
        const finish = cols[timeIdx] ?? ''
        const bib = parseInt(bibRaw)

        if (!bibRaw || isNaN(bib)) {
          failures.push({ line: i + 1, bib: bibRaw || '(blank)', reason: 'Invalid BIB number' })
          continue
        }
        if (!finish) {
          failures.push({ line: i + 1, bib: bibRaw, reason: 'Missing finish time' })
          continue
        }

        const { data, error } = await supabase
          .from('participants')
          .update({
            finish_time: finish,
            status: 'certified',
            certified_at: new Date().toISOString(),
          })
          .eq('bib_number', bib)
          .select('id')

        if (error) {
          failures.push({ line: i + 1, bib: bibRaw, reason: error.message })
        } else if (!data || data.length === 0) {
          failures.push({ line: i + 1, bib: bibRaw, reason: 'Unknown BIB — no matching participant' })
        } else {
          success++
          notify(data[0].id, 'certified')
        }
      }

      setSummary({ success, failures })
      if (success > 0) {
        toast.success(`${success} participant${success === 1 ? '' : 's'} certified from CSV`)
        router.refresh()
      }
      if (success === 0 && failures.length > 0) {
        toast.error('No rows could be processed — check the file format.')
      }
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6" data-testid="csv-upload">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Bulk finish times (CSV)</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Columns: <code className="bg-gray-100 px-1 rounded">bib</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">finish_time</code> — matching rows are
            marked <strong>certified</strong>.
          </p>
        </div>
        <label className="shrink-0">
          <input
            ref={fileRef}
            data-testid="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            disabled={processing}
            className="hidden"
          />
          <span
            className={`inline-block cursor-pointer text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              processing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {processing ? 'Processing…' : '⬆ Upload CSV'}
          </span>
        </label>
      </div>

      {summary && (
        <div className="mt-4 border-t border-gray-100 pt-3" data-testid="csv-summary">
          <p className="text-sm">
            <span className="font-semibold text-green-600">{summary.success} succeeded</span>
            {summary.failures.length > 0 && (
              <span className="text-red-500 font-semibold"> · {summary.failures.length} failed</span>
            )}
          </p>
          {summary.failures.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {summary.failures.map((f, i) => (
                <li key={i} className="text-xs text-red-500">
                  Line {f.line} (BIB {f.bib}): {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
