import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Check if Supabase is configured before creating client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[v0] Supabase not configured, skipping session update')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // We add the explicit type definition right here 👇
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  let user = null;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error: any) {
    // If the error is just an invalid refresh token, we can safely ignore it.
    // The user will simply be treated as unauthenticated and redirected to login.
    if (error?.status === 400 && error?.code === 'refresh_token_not_found') {
      console.log('[Auth] User session expired or invalid refresh token. Continuing as guest.')
    } else {
      console.error('[Auth] Error getting user in middleware:', error)
    }
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/scan', '/onboarding']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check onboarding status for authenticated users on dashboard/scan
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/scan'))) {
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    // Redirect to onboarding if not completed
    if (!profile?.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged in users away from auth pages (but not from onboarding)
  // Exception: /auth/reset-password must be accessible even when logged in,
  // because Supabase establishes a session before the user can set their new password.
  const isResetPage = request.nextUrl.pathname.startsWith('/auth/reset-password')
  if (request.nextUrl.pathname.startsWith('/auth/') && user && !isResetPage) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
