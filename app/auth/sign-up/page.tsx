'use client'

import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:     '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:  'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    const supabase = createClient()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )

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
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Create Account
          </h1>
          <p className="text-sm font-medium text-[#6b7e6d]">Start your journey to healthier eating</p>
        </div>

        <div className="mb-7 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: '#d5dfd6' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Sign Up</span>
          <div className="h-px flex-1" style={{ background: '#d5dfd6' }} />
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">Email Address</Label>
            <div className="rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <input id="email" type="email" placeholder="you@example.com" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">Password</Label>
            <div className="relative rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-13 w-full rounded-2xl bg-transparent px-4 py-3.5 pr-12 text-sm font-medium text-[#1a231b] placeholder:text-[#6b7e6d]/50 outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7e6d] hover:text-[#1a231b]">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="ml-1 text-xs font-bold uppercase tracking-wide text-[#6b7e6d]">Confirm Password</Label>
            <div className="rounded-2xl" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" required value={confirmPassword}
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
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#6b7e6d]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-[#3ecf66] hover:underline">Sign In</Link>
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
