'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 pb-2">
        <Link
          href="/auth/login"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8L2 12l4 4" />
            <path d="M2 12h20" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/20 p-1.5">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">NutriScan</h2>
        </div>
        <div className="h-12 w-12 shrink-0" />
      </div>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-start px-6 pt-10">
        {sent ? (
          /* Success state */
          <div className="flex w-full flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-extrabold">Check your email</h1>
              <p className="text-base text-muted-foreground">
                We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. It may take a minute to arrive.
              </p>
            </div>
            <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                className="font-semibold text-primary hover:underline"
              >
                try again
              </button>
              .
            </div>
            <Link
              href="/auth/login"
              className="text-sm font-bold text-primary hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="mb-8 w-full text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-[32px] font-extrabold leading-tight tracking-tight">Forgot password?</h1>
              <p className="text-base text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="ml-1 text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-xl border-border bg-card px-4 text-base font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-14 rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-auto py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/auth/login" className="font-bold text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
