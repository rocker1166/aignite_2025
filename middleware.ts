import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in, allow the request to continue
  if (!session) {
    return res
  }

  // If user is logged in, check if they have a complete profile
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('organisation_name, location, employee_count, industry, sub_industry')
      .eq('id', session.user.id)
      .single()

    // Check if profile is incomplete
    const isProfileIncomplete = !userData || 
      !userData.organisation_name || 
      !userData.location || 
      !userData.employee_count || 
      !userData.industry || 
      !userData.sub_industry

    // If profile is incomplete and not already on profile page, redirect to profile with popup
    if (isProfileIncomplete && !req.nextUrl.pathname.includes('/profile')) {
      const url = req.nextUrl.clone()
      url.pathname = '/profile'
      url.searchParams.set('show_popup', 'true')
      return NextResponse.redirect(url)
    }

  } catch (error) {
    console.error('Error checking user profile:', error)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     * - signin (signin page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|signin).*)',
  ],
}
