import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Refresh session — required for SSR auth
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const isAdminLogin = pathname === '/admin/login'

    if (!user && !isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (user && isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/participants', request.url))
    }
  }

  // ── Volunteer routes ──────────────────────────────────────────────────────
  if (pathname.startsWith('/volunteer')) {
    const isVolunteerLogin = pathname === '/volunteer/login'

    if (!user && !isVolunteerLogin) {
      // Unauthenticated — send to volunteer login
      return NextResponse.redirect(new URL('/volunteer/login', request.url))
    }

    if (user && isVolunteerLogin) {
      // Authenticated user hitting login — route by role
      const role = (user.user_metadata as { role?: string } | null)?.role
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/participants', request.url))
      }
      return NextResponse.redirect(new URL('/volunteer/scan', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/volunteer/:path*'],
}
