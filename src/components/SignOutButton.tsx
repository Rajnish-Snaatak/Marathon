'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      data-testid="signout-button"
      onClick={handleSignOut}
      className="text-sm bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white px-3 py-1 rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}
