import Link from 'next/link'

const RACE_NAME     = process.env.NEXT_PUBLIC_RACE_NAME ?? 'City Marathon 2026'
const RACE_DATE     = 'Monday, June 1, 2026'
const RACE_TIME     = 'Start: 6:00 AM IST'
const RACE_LOCATION = 'Nehru Stadium, New Delhi, India'

const DISTANCES = [
  {
    label: '5K Run',
    distance: '5 km',
    tag: 'Beginner Friendly',
    tagColor: 'bg-green-100 text-green-700',
    desc: 'Perfect for first-timers and fitness enthusiasts.',
    icon: '🏃',
  },
  {
    label: '10K Run',
    distance: '10 km',
    tag: 'Popular',
    tagColor: 'bg-blue-100 text-blue-700',
    desc: 'The classic city run for regular runners.',
    icon: '⚡',
  },
  {
    label: 'Half Marathon',
    distance: '21.1 km',
    tag: 'Intermediate',
    tagColor: 'bg-orange-100 text-orange-700',
    desc: 'Test your endurance across the city\'s landmarks.',
    icon: '🔥',
  },
  {
    label: 'Full Marathon',
    distance: '42.2 km',
    tag: 'Elite',
    tagColor: 'bg-purple-100 text-purple-700',
    desc: 'The ultimate challenge for seasoned runners.',
    icon: '🏅',
  },
]

const FAQS = [
  {
    q: 'When does registration close?',
    a: 'Registration closes on May 31, 2026 or when capacity is reached — whichever comes first. Register early to secure your spot.',
  },
  {
    q: 'What is included in the entry fee?',
    a: 'Race BIB, official timing chip, finisher medal, event T-shirt, hydration stations, and a post-race snack pack.',
  },
  {
    q: 'Can I transfer or cancel my registration?',
    a: 'Transfers to another participant are allowed up to May 25, 2026. Registrations are non-refundable.',
  },
  {
    q: 'What should I bring on race day?',
    a: 'Your BIB number (displayed on the /status page), a valid photo ID, and comfortable running gear. No pacers or earphones beyond 10K.',
  },
  {
    q: 'Where can I check my registration status?',
    a: 'Visit the Status page and enter your email or BIB number to track your journey from registration to finisher certificate.',
  },
]

const SPONSORS = {
  platinum: [
    { name: 'TechCorp India', logo: '🔷' },
  ],
  gold: [
    { name: 'FitLife Sports', logo: '🥇' },
    { name: 'RunFast Gear',   logo: '👟' },
  ],
  silver: [
    { name: 'HealthPlus',   logo: '💊' },
    { name: 'City Hotels',  logo: '🏨' },
    { name: 'SportZone',    logo: '🎽' },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-indigo-700 text-lg">🏃 {RACE_NAME}</span>
          <div className="flex items-center gap-4">
            <Link href="/status" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
              My Status
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-14 min-h-screen flex items-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-5xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
              Registration Open
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {RACE_NAME}
            </h1>
            <p className="text-xl text-gray-500 mb-3">
              📅 {RACE_DATE} &nbsp;·&nbsp; {RACE_TIME}
            </p>
            <p className="text-xl text-gray-500 mb-10">
              📍 {RACE_LOCATION}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                Register Now →
              </Link>
              <Link
                href="/status"
                className="inline-block bg-white hover:bg-gray-50 text-indigo-600 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-indigo-200 transition-colors"
              >
                Track My Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Distances ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Choose Your Distance</h2>
          <p className="text-gray-400 text-center mb-12">Four categories for every level of runner.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DISTANCES.map(d => (
              <div key={d.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{d.icon}</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.tagColor}`}>
                  {d.tag}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mt-3">{d.label}</h3>
                <p className="text-3xl font-extrabold text-indigo-600 my-1">{d.distance}</p>
                <p className="text-sm text-gray-500">{d.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Secure Your Spot →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-center mb-12">Everything you need to know before race day.</p>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Q: {faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsors ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Our Sponsors</h2>
          <p className="text-gray-400 text-center mb-14">Proud partners making this event possible.</p>

          {/* Platinum */}
          <div className="text-center mb-10">
            <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              🔷 Platinum
            </span>
            <div className="flex justify-center gap-6">
              {SPONSORS.platinum.map(s => (
                <div key={s.name} className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-2xl px-12 py-8 shadow-sm">
                  <div className="text-5xl mb-3 text-center">{s.logo}</div>
                  <p className="text-xl font-bold text-gray-700 text-center">{s.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gold */}
          <div className="text-center mb-10">
            <span className="inline-block bg-yellow-50 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              🥇 Gold
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              {SPONSORS.gold.map(s => (
                <div key={s.name} className="bg-yellow-50 border border-yellow-100 rounded-2xl px-8 py-6 shadow-sm">
                  <div className="text-4xl mb-2 text-center">{s.logo}</div>
                  <p className="text-lg font-semibold text-gray-700 text-center">{s.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Silver */}
          <div className="text-center">
            <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              🥈 Silver
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              {SPONSORS.silver.map(s => (
                <div key={s.name} className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 shadow-sm">
                  <div className="text-3xl mb-1 text-center">{s.logo}</div>
                  <p className="text-sm font-semibold text-gray-600 text-center">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-5xl mb-4">🏁</div>
          <h2 className="text-3xl font-bold mb-3">Ready to Run?</h2>
          <p className="text-indigo-200 mb-8">
            Spots are limited. Register before {RACE_DATE.split(',')[1].trim()} and be part of the city's biggest race.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white hover:bg-gray-100 text-indigo-700 font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-xl"
          >
            Register Now →
          </Link>
        </div>
      </section>

      {/* ── Site footer ───────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-500 text-xs py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 {RACE_NAME}. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/status"   className="hover:text-white transition-colors">My Status</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
