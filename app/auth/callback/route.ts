import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? ''

  // Detect password recovery callbacks — redirect to reset page, not dashboard
  const isRecovery = type === 'recovery' || next.includes('reset-password')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const getRedirect = (path: string) => {
        if (isLocalEnv) return `${origin}${path}`
        if (forwardedHost) return `https://${forwardedHost}${path}`
        return `${origin}${path}`
      }

      // For password reset: send user to the reset page (session is already established)
      if (isRecovery) {
        return NextResponse.redirect(getRedirect('/auth/reset-password'))
      }

      // For normal email verification: check onboarding state
      const { data: profile } = await supabase
        .from('health_profiles')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .single()

      const redirectPath = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(getRedirect(redirectPath))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error?error=Could not verify email`)
}
