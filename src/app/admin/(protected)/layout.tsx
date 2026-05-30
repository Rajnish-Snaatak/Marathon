import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">
            🏃 {process.env.NEXT_PUBLIC_RACE_NAME ?? 'Marathon Admin'}
          </span>
          <Link
            href="/admin/participants"
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            Participants
          </Link>
          <Link
            href="/admin/race-day"
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            Race Day
          </Link>
          <Link
            href="/admin/tasks"
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            Tasks
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-indigo-300">{user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
