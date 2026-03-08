'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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
    // Supabase puts the recovery token in the URL hash; the client SDK
    // detects it automatically when we call getSession().
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true)
      }
      setChecking(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Sign out so the user logs in fresh with the new password
      await supabase.auth.signOut()
      router.push('/auth/login?reset=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 pb-2">
        <div className="h-12 w-12 shrink-0" />
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
        {!isValidSession ? (
          /* Invalid / expired link */
          <div className="flex w-full flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-10 w-10 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-extrabold">Link expired</h1>
              <p className="text-base text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <Link
              href="/auth/forgot-password"
              className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Request New Link
            </Link>
            <Link href="/auth/login" className="text-sm font-bold text-primary hover:underline">
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          /* Reset form */
          <>
            <div className="mb-8 w-full text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-[32px] font-extrabold leading-tight tracking-tight">Set new password</h1>
              <p className="text-base text-muted-foreground">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="ml-1 text-sm font-semibold">New Password</Label>
                <div className="relative flex w-full">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-xl border-border bg-card px-4 pr-12 text-base font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password" className="ml-1 text-sm font-semibold">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
