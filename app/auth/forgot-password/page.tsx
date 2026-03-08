'use client'

import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

const neu = {
  sm:    '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#eaf0eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link href="/auth/login"
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        {sent ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
              <svg className="h-9 w-9 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Check your email</h1>
              <p className="text-sm text-[#6b7e6d]">We sent a reset link to <span className="font-bold text-[#1a231b]">{email}</span>. It may take a minute.</p>
            </div>
            <div className="w-full rounded-2xl p-4 text-sm text-[#6b7e6d]"
              style={{ background: 'rgba(62,207,102,0.06)', border: '1px solid rgba(62,207,102,0.2)' }}>
              Didn&apos;t receive it? Check spam or{' '}
              <button onClick={() => setSent(false)} className="font-bold text-[#3ecf66] hover:underline">try again</button>.
            </div>
            <Link href="/auth/login" className="text-sm font-bold text-[#3ecf66] hover:underline">← Back to Sign In</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
                  <svg className="h-7 w-7 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Forgot password?</h1>
              <p className="text-sm text-[#6b7e6d]">Enter your email to receive a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">Email Address</Label>
                <div className="rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
                  <input id="email" type="email" placeholder="you@example.com" required value={email}
                    onChange={e => setEmail(e.target.value)}
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
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#6b7e6d]">
                Remember your password?{' '}
                <Link href="/auth/login" className="font-bold text-[#3ecf66] hover:underline">Sign In</Link>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
