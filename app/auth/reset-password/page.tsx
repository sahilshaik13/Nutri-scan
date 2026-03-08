'use client'

import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const neu = {
  sm:    '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  raised:'8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  inset: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsValidSession(true)
      setChecking(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError("Passwords don't match"); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setIsLoading(true); setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      router.push('/auth/login?reset=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setIsLoading(false) }
  }

  if (checking) return (
    <div className="flex min-h-svh items-center justify-center" style={{ background: '#eaf0eb' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3ecf66] border-t-transparent" />
    </div>
  )

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#eaf0eb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="w-10" />
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        {!isValidSession ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
              <svg className="h-9 w-9 text-[#e05555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Link expired</h1>
              <p className="text-sm text-[#6b7e6d]">This reset link is invalid or has expired. Please request a new one.</p>
            </div>
            <Link href="/auth/forgot-password"
              className="flex w-full items-center justify-center rounded-2xl py-3.5 text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 12px #becea5' }}>
              Request New Link
            </Link>
            <Link href="/auth/login" className="text-sm font-bold text-[#3ecf66] hover:underline">← Back to Sign In</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
                  <svg className="h-7 w-7 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Set new password</h1>
              <p className="text-sm text-[#6b7e6d]">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">New Password</Label>
                <div className="relative rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
                  <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 pr-12 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7e6d]">
                    {showPassword
                      ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                      : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">Confirm Password</Label>
                <div className="rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
                  <input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" required value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none" />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl p-3 text-sm font-medium text-[#e05555]"
                  style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="mt-2 h-13 w-full rounded-2xl py-3.5 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 12px #becea5, -3px -3px 8px #ffffff' }}>
                {isLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
