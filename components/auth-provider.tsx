'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

const PUBLIC_PATHS = ['/', '/auth/', '/guest-scan']
const PROTECTED_PATHS = ['/dashboard', '/scan', '/history', '/insights', '/profile', '/onboarding']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle redirects after auth state is known
  useEffect(() => {
    if (loading) return

    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))

    // Redirect unauthenticated users from protected paths
    if (!user && isProtectedPath) {
      router.replace('/auth/login')
      return
    }

    // Redirect authenticated users from auth pages to dashboard
    if (user && pathname.startsWith('/auth/')) {
      router.replace('/dashboard')
      return
    }
  }, [user, loading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
