'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { notify } from '@/lib/notify'
import toast from 'react-hot-toast'

type Mode = 'entry' | 'finish'

interface ScanResult {
  bib: number
  name: string
  from: string
  to: string
  ok: boolean
  message: string
}

export default function VolunteerScanPage() {
  const supabase = createClient()
  const router = useRouter()
  const raceName = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'

  const [userEmail, setUserEmail] = useState('')
  const [mode, setMode] = useState<Mode>('entry')
  const modeRef = useRef<Mode>('entry')
  const [manualBib, setManualBib] = useState('')
  const [processing, setProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)

  // Fetch logged-in user's email for the header
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? '')
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/volunteer/login')
    router.refresh()
  }

  // Keep modeRef in sync without reinitialising the scanner
  useEffect(() => { modeRef.current = mode }, [mode])

  // Debounce: avoid double-firing the same QR code
  const lastScanRef = useRef<{ bib: number; time: number } | null>(null)

  // ── Core transition logic ────────────────────────────────────────────────

  const processBib = async (bib: number) => {
    if (processing) return
    setProcessing(true)

    try {
      const { data: p, error } = await supabase
        .from('participants')
        .select('id, name, status, bib_number')
        .eq('bib_number', bib)
        .single()

      if (error || !p) {
        const msg = `BIB #${bib} not found.`
        toast.error(msg)
        setLastResult({ bib, name: '—', from: '—', to: '—', ok: false, message: msg })
        return
      }

      const currentMode = modeRef.current

      if (currentMode === 'entry') {
        if (p.status === 'bib_collected' || p.status === 'certified') {
          const msg = `BIB #${bib} (${p.name}) already checked in.`
          toast.error(msg)
          setLastResult({ bib, name: p.name, from: p.status, to: p.status, ok: false, message: msg })
          return
        }
        if (p.status !== 'confirmed') {
          const msg = `BIB #${bib} (${p.name}) is not confirmed yet — status: ${p.status}.`
          toast.error(msg)
          setLastResult({ bib, name: p.name, from: p.status, to: p.status, ok: false, message: msg })
          return
        }
        const { error: e } = await supabase
          .from('participants')
          .update({ status: 'bib_collected' })
          .eq('id', p.id)
        if (e) { toast.error('Update failed: ' + e.message); return }
        notify(p.id, 'bib_collected')
        const msg = `BIB #${bib} — ${p.name} checked in!`
        toast.success('✅ ' + msg)
        setLastResult({ bib, name: p.name, from: 'confirmed', to: 'bib_collected', ok: true, message: msg })

      } else {
        if (p.status === 'certified') {
          const msg = `BIB #${bib} (${p.name}) already certified.`
          toast.error(msg)
          setLastResult({ bib, name: p.name, from: p.status, to: p.status, ok: false, message: msg })
          return
        }
        if (p.status !== 'bib_collected') {
          const msg = `BIB #${bib} (${p.name}) has not checked in yet — status: ${p.status}.`
          toast.error(msg)
          setLastResult({ bib, name: p.name, from: p.status, to: p.status, ok: false, message: msg })
          return
        }
        const { error: e } = await supabase
          .from('participants')
          .update({ status: 'certified', certified_at: new Date().toISOString() })
          .eq('id', p.id)
        if (e) { toast.error('Update failed: ' + e.message); return }
        notify(p.id, 'certified')
        const msg = `BIB #${bib} — ${p.name} certified!`
        toast.success('🏅 ' + msg)
        setLastResult({ bib, name: p.name, from: 'bib_collected', to: 'certified', ok: true, message: msg })
      }
    } finally {
      setProcessing(false)
    }
  }

  // ── QR scan handler ──────────────────────────────────────────────────────

  const handleQrScan = async (text: string) => {
    const bib = parseInt(text.trim())
    if (isNaN(bib)) return

    const now = Date.now()
    if (lastScanRef.current?.bib === bib && now - lastScanRef.current.time < 3000) return
    lastScanRef.current = { bib, time: now }

    await processBib(bib)
  }

  // ── Initialise html5-qrcode scanner ─────────────────────────────────────

  useEffect(() => {
    let scanner: { clear: () => Promise<void> } | null = null

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      ) as { clear: () => Promise<void> }
      ;(scanner as any).render(handleQrScan, () => {})
    })

    return () => {
      if (scanner) scanner.clear().catch(() => {})
    }
  }, []) // init once — mode changes handled via modeRef

  // ── Manual fallback ──────────────────────────────────────────────────────

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const bib = parseInt(manualBib.trim())
    if (isNaN(bib)) { toast.error('Enter a valid BIB number.'); return }
    await processBib(bib)
    setManualBib('')
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📷 Volunteer Scanner</h1>
            <p className="text-xs text-gray-400 mt-0.5">{raceName}</p>
          </div>
          <div className="text-right">
            {userEmail && <p className="text-xs text-gray-400 mb-1">{userEmail}</p>}
            <button
              data-testid="volunteer-signout"
              onClick={handleSignOut}
              className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4 bg-white shadow-sm">
          <button
            onClick={() => setMode('entry')}
            data-testid="mode-entry"
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === 'entry' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🚪 Entry Check-in
          </button>
          <button
            onClick={() => setMode('finish')}
            data-testid="mode-finish"
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === 'finish' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🏁 Finish Line
          </button>
        </div>

        {/* Mode hint */}
        <div className={`rounded-xl p-2.5 text-xs text-center mb-5 ${
          mode === 'entry' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-700'
        }`}>
          {mode === 'entry'
            ? 'Entry: confirmed → BIB Collected'
            : 'Finish: BIB Collected → Certified + certificate'}
        </div>

        {/* Camera scanner */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
          <div id="qr-reader" className="w-full" data-testid="qr-reader" />
        </div>

        {/* Manual fallback */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide">
            Manual BIB entry — camera fallback
          </p>
          <form onSubmit={handleManualSubmit} className="flex gap-2" data-testid="manual-form">
            <input
              data-testid="manual-bib-input"
              type="number"
              inputMode="numeric"
              value={manualBib}
              onChange={e => setManualBib(e.target.value)}
              placeholder="1001"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-3xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              data-testid="manual-bib-submit"
              type="submit"
              disabled={processing || !manualBib.trim()}
              className={`px-6 font-bold rounded-xl transition-colors text-white disabled:opacity-40 ${
                mode === 'entry' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {processing ? '…' : 'Go'}
            </button>
          </form>
        </div>

        {/* Last scan result */}
        {lastResult && (
          <div
            data-testid="scan-result"
            className={`rounded-2xl p-4 shadow-sm ${
              lastResult.ok
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={`font-semibold text-sm ${lastResult.ok ? 'text-green-700' : 'text-red-600'}`}>
              {lastResult.ok ? '✅' : '❌'} BIB #{lastResult.bib} — {lastResult.name}
            </p>
            {lastResult.ok ? (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {lastResult.from} → {lastResult.to}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">{lastResult.message}</p>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          <a href="/" className="hover:text-indigo-500">← Back to event</a>
        </p>
      </div>
    </div>
  )
}
