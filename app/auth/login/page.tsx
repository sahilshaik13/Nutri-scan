'use client'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:     '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:  'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

function VerificationMessage() {
  const searchParams = useSearchParams()
  const isVerified = searchParams.get('verified') === 'true'
  const isReset = searchParams.get('reset') === 'true'

  if (isVerified) return (
    <div className="mb-5 rounded-2xl p-4 text-center text-sm font-semibold text-[#2bb554]"
      style={{ background: 'rgba(62,207,102,0.08)', border: '1px solid rgba(62,207,102,0.25)' }}>
      ✅ Email verified successfully! Please log in.
    </div>
  )
  if (isReset) return (
    <div className="mb-5 rounded-2xl p-4 text-center text-sm font-semibold text-[#2bb554]"
      style={{ background: 'rgba(62,207,102,0.08)', border: '1px solid rgba(62,207,102,0.25)' }}>
      ✅ Password updated! Sign in with your new password.
    </div>
  )
  return null
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    console.log('[Login Attempt]', { email, hasPassword: !!password, supabaseActive: !!supabase.auth })
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[Login Error Debug]:', err)
      
      // Attempt to extract the most descriptive error message possible
      let errorMessage = 'An error occurred during sign in. Check console.'
      
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.error_description) {
        errorMessage = err.error_description
      } else if (err?.error?.message) {
        errorMessage = err.error.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object') {
        try {
          errorMessage = 'API Error: ' + JSON.stringify(err)
        } catch { /* ignore JSON stringify errors */ }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#eaf0eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105"
          style={{ background: '#eaf0eb', boxShadow: neu.sm }}
        >
          <svg className="h-5 w-5 text-[#6b7e6d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8L2 12l4 4" /><path d="M2 12h20" />
          </svg>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span className="text-base font-black text-[#1a231b]">NutriScan</span>
        </Link>
        <div className="w-10" />
      </div>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Welcome back
          </h1>
          <p className="text-sm font-medium text-[#6b7e6d]">Sign in to continue your healthy journey</p>
        </div>

        <Suspense fallback={null}>
          <VerificationMessage />
        </Suspense>

        {/* Divider */}
        <div className="mb-7 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: '#d5dfd6' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Email Login</span>
          <div className="h-px flex-1" style={{ background: '#d5dfd6' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">
              Email Address
            </Label>
            <div className="rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="ml-1 flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">
                Password
              </Label>
              <Link href="/auth/forgot-password" className="text-xs font-bold text-[#3ecf66] hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 pr-12 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7e6d] hover:text-[#1a231b]"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" x2="23" y1="1" y2="23" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl p-3 text-sm font-medium text-[#e05555]"
              style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-13 w-full rounded-2xl py-3.5 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 12px #becea5, -3px -3px 8px #ffffff' }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6b7e6d]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-bold text-[#3ecf66] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">
          {['Terms', 'Privacy', 'Help'].map(l => (
            <a key={l} href="#" className="hover:text-[#3ecf66] transition-colors">{l}</a>
          ))}
        </div>
      </main>
    </div>
  )
}