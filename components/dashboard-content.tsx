'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User as SupabaseUser } from '@supabase/supabase-js'

/* ─── Types ─────────────────────────────────────────────── */
interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

interface FoodScan {
  id: string
  food_name: string
  image_url: string | null
  ingredients: string[]
  nutrition_data: {
    serving_size?: string
    calories: number
    total_fat: number
    saturated_fat?: number
    trans_fat?: number
    cholesterol?: number
    sodium?: number
    total_carbohydrates: number
    dietary_fiber?: number
    total_sugars?: number
    added_sugars?: number
    protein: number
    vitamin_d?: number
    calcium?: number
    iron?: number
    potassium?: number
    health_insights?: string[]
    recommendations?: string[]
    personal_health_impacts?: PersonalHealthImpact[]
  }
  health_score: number
  health_rating: string
  created_at: string
}

interface DashboardContentProps {
  user: SupabaseUser
  initialScans: FoodScan[]
}

/* ─── Helpers ───────────────────────────────────────────── */
function getHealthColor(score: number): string {
  if (score >= 80) return '#3ecf66'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#ec4899'
  return '#ef4444'
}

function getHealthBadgeVariant(rating: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (rating.toLowerCase()) {
    case 'excellent': case 'good': case 'very_healthy': case 'healthy': return 'default'
    case 'moderate': return 'secondary'
    case 'poor': case 'very poor': case 'unhealthy': case 'very_unhealthy': return 'destructive'
    default: return 'outline'
  }
}

function getImpactColor(level: string) {
  switch (level) {
    case 'safe':    return { bg: 'rgba(62,207,102,0.08)',  border: 'rgba(62,207,102,0.25)',  text: '#2bb554', icon: '#2bb554' }
    case 'caution': return { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  text: '#d97706', icon: '#d97706' }
    case 'warning': return { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.25)',  text: '#db2777', icon: '#db2777' }
    case 'danger':  return { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   text: '#dc2626', icon: '#dc2626' }
    default:        return { bg: '#f4f7f4', border: '#d5dfd6', text: '#1a231b', icon: '#6b7e6d' }
  }
}

function getImpactIcon(level: string) {
  const icons: Record<string, JSX.Element> = {
    safe: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    caution: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    danger: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
  }
  return icons[level] ?? null
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatRating(rating: string) {
  return rating.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/* ─── Neumorphic style helpers ──────────────────────────── */
const neu = {
  raised:  '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:      '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:   'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
  pressed: 'inset 3px 3px 7px #c0c8c1, inset -3px -3px 7px #f4faf5',
}

/* ─── Component ─────────────────────────────────────────── */
export function DashboardContent({ user, initialScans }: DashboardContentProps) {
  const router = useRouter()
  const [scans, setScans] = useState<FoodScan[]>(initialScans)
  const [selectedScan, setSelectedScan] = useState<FoodScan | null>(null)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('food_scans').delete().eq('id', id)
    if (!error) {
      setScans(prev => prev.filter(s => s.id !== id))
      if (selectedScan?.id === id) setSelectedScan(null)
    }
  }

  const todayScans = scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString())
  const todayCalories = todayScans.reduce((sum, s) => sum + (s.nutrition_data?.calories || 0), 0)
  const avgHealthScore = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + s.health_score, 0) / scans.length)
    : 0

  /* health score ring ratio */
  const ringCircumference = 2 * Math.PI * 27 // r=27 → 169.6
  const ringOffset = ringCircumference - (avgHealthScore / 100) * ringCircumference

  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 px-4 pt-3 pb-2"
        style={{ background: '#eaf0eb' }}
      >
        <div
          className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-2xl px-4"
          style={{ background: '#eaf0eb', boxShadow: neu.sm }}
        >
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ background: '#eaf0eb', boxShadow: neu.sm }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className="text-base font-black tracking-tight text-[#1a231b]">NutriScan</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className="flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 8px #becea5, -2px -2px 6px #ffffff' }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Scan
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105"
                  style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                >
                  <svg className="h-4 w-4 text-[#6b7e6d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl" style={{ background: '#eaf0eb', boxShadow: neu.raised, border: 'none' }}>
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#1a231b]">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#d5dfd6]" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer rounded-xl text-[#6b7e6d] hover:text-[#1a231b]">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Health Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#d5dfd6]" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer rounded-xl text-[#ef4444] focus:text-[#ef4444]"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5">

        {/* ── Welcome row ───────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }} suppressHydrationWarning>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-[#6b7e6d]">Here's your nutrition snapshot</p>
        </div>

        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Calories card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#6b7e6d]">Calories Today</p>
            <p className="text-3xl font-black text-[#1a231b]" suppressHydrationWarning>
              {todayCalories}
              <span className="ml-1 text-base font-semibold text-[#6b7e6d]">kcal</span>
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ boxShadow: neu.inset, background: '#eaf0eb' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (todayCalories / 2000) * 100)}%`,
                  background: 'linear-gradient(90deg, #3ecf66, #2bb554)',
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-[#6b7e6d]">{Math.round((todayCalories / 2000) * 100)}% of daily goal</p>
          </div>

          {/* Health Score card with ring */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#6b7e6d]">Avg Health Score</p>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#d5dfd6" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="27"
                    fill="none"
                    stroke={getHealthColor(avgHealthScore)}
                    strokeWidth="5"
                    strokeDasharray={`${(avgHealthScore / 100) * 169.6} 169.6`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <span className="text-sm font-black text-[#1a231b]" suppressHydrationWarning>{avgHealthScore}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#1a231b]" suppressHydrationWarning>
                  {avgHealthScore}<span className="text-base font-semibold text-[#6b7e6d]">/100</span>
                </p>
                <p className="text-xs font-semibold" style={{ color: getHealthColor(avgHealthScore) }}>
                  {avgHealthScore >= 80 ? 'Excellent' : avgHealthScore >= 60 ? 'Good' : avgHealthScore >= 40 ? 'Fair' : 'Needs Work'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Scans card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#6b7e6d]">Total Scans</p>
            <p className="text-3xl font-black text-[#1a231b]" suppressHydrationWarning>{scans.length}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              >
                <svg className="h-3.5 w-3.5 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <p className="text-xs text-[#6b7e6d]">{todayScans.length} today</p>
            </div>
          </div>
        </div>

        {/* ── Scan Grid ─────────────────────────────────── */}
        <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1a231b]">Recent Scans</h2>
            {scans.length > 0 && (
              <button className="text-xs font-bold text-[#3ecf66] transition-opacity hover:opacity-70">View All</button>
            )}
          </div>

          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl"
                style={{ background: '#eaf0eb', boxShadow: neu.inset }}
              >
                <svg className="h-9 w-9 text-[#3ecf66] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-bold text-[#1a231b]">No scans yet</h3>
              <p className="mb-6 text-sm text-[#6b7e6d]">Start scanning your food to track nutrition</p>
              <Link
                href="/scan"
                className="flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 10px #becea5, -2px -2px 6px #ffffff' }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                Scan Your First Food
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="group cursor-pointer rounded-2xl p-3 transition-all duration-200 active:scale-95 flex flex-col"
                  style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                  onClick={() => setSelectedScan(scan)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '8px 8px 18px #bec7bf, -8px -8px 18px #ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = neu.sm)}
                >
                  <div
                    className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl shrink-0"
                    style={{ boxShadow: 'inset 2px 2px 6px #c4ccc5, inset -2px -2px 6px #ffffff' }}
                  >
                    {scan.image_url ? (
                      <Image src={scan.image_url} alt={scan.food_name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: '#eaf0eb' }}>
                        <svg className="h-8 w-8 text-[#3ecf66] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        </svg>
                      </div>
                    )}
                    {/* Score badge */}
                    <div
                      className="absolute right-2 top-2 rounded-lg px-2 py-1"
                      style={{ background: 'rgba(234,240,235,0.9)', backdropFilter: 'blur(4px)', boxShadow: '2px 2px 5px #c4ccc5' }}
                    >
                      <div className="text-[10px] font-black" style={{ color: getHealthColor(scan.health_score) }}>
                        {scan.health_score}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 justify-end px-1 pb-1">
                    <div className="truncate text-sm font-bold text-[#1a231b] leading-tight">{scan.food_name}</div>
                    <div className="mt-1 text-xs text-[#6b7e6d]">{formatDate(scan.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Detail Dialog ───────────────────────────────── */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-0 sm:max-w-lg overflow-x-hidden pr-2 [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#eaf0eb] [&::-webkit-scrollbar-track]:shadow-[inset_2px_2px_4px_#c4ccc5,inset_-2px_-2px_4px_#ffffff] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d5dfd6] [&::-webkit-scrollbar-thumb]:shadow-[2px_2px_4px_#c4ccc5,-2px_-2px_4px_#ffffff] hover:[&::-webkit-scrollbar-thumb]:bg-[#c4ccc5]"
          style={{ background: '#eaf0eb', boxShadow: '20px 20px 50px #bec7bf, -20px -20px 50px #d5dfd6', borderRadius: '1.5rem' }}
        >
          {selectedScan && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {selectedScan.food_name}
                </DialogTitle>
              </DialogHeader>

              {selectedScan.image_url && (
                <div className="relative h-44 w-full overflow-hidden rounded-2xl" style={{ boxShadow: neu.inset }}>
                  <Image src={selectedScan.image_url} alt={selectedScan.food_name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#eaf0eb]/40 to-transparent" />
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: 'rgba(234,240,235,0.9)', backdropFilter: 'blur(8px)', boxShadow: '2px 2px 5px #c4ccc5' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3ecf66] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf66]">AI Verified</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Score row */}
                <div className="flex items-center justify-between">
                  <Badge variant={getHealthBadgeVariant(selectedScan.health_rating)}>
                    {formatRating(selectedScan.health_rating)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-12 w-12 items-center justify-center">
                      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#d5dfd6" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none"
                          stroke={getHealthColor(selectedScan.health_score)}
                          strokeWidth="4"
                          strokeDasharray={`${(selectedScan.health_score / 100) * 125.7} 125.7`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs font-black text-[#1a231b]">{selectedScan.health_score}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#6b7e6d]">/100</span>
                  </div>
                </div>

                {/* Macro bars */}
                <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                  {[
                    { label: 'Calories', val: `${selectedScan.nutrition_data?.calories || 0} kcal`, pct: null },
                    { label: 'Protein',  val: `${selectedScan.nutrition_data?.protein || 0}g`,     pct: Math.min(100, ((selectedScan.nutrition_data?.protein || 0) / 50) * 100),  color: '#3ecf66' },
                    { label: 'Carbs',    val: `${selectedScan.nutrition_data?.total_carbohydrates || 0}g`, pct: Math.min(100, ((selectedScan.nutrition_data?.total_carbohydrates || 0) / 80) * 100), color: '#f59e0b' },
                    { label: 'Fat',      val: `${selectedScan.nutrition_data?.total_fat || 0}g`,  pct: Math.min(100, ((selectedScan.nutrition_data?.total_fat || 0) / 40) * 100),  color: '#3b82f6' },
                  ].map(m => (
                    <div key={m.label} className="mb-3 last:mb-0">
                      <div className="mb-1 flex justify-between text-xs font-semibold">
                        <span className="text-[#6b7e6d]">{m.label}</span>
                        <span className="text-[#1a231b]">{m.val}</span>
                      </div>
                      {m.pct !== null && (
                        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.pressed }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${m.pct}%`, background: m.color, opacity: 0.85 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Full Nutrition Table */}
                <div className="rounded-2xl overflow-hidden" style={{ boxShadow: neu.sm }}>
                  <div className="px-4 py-3" style={{ background: '#eaf0eb', borderBottom: '1px solid #d5dfd6' }}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#3ecf66]">Nutrition Facts</h4>
                    {selectedScan.nutrition_data?.serving_size && (
                      <p className="text-xs text-[#6b7e6d]">Serving: {selectedScan.nutrition_data.serving_size}</p>
                    )}
                  </div>
                  <div className="divide-y divide-[#d5dfd6]" style={{ background: '#eaf0eb' }}>
                    {[
                      { label: 'Total Fat',   val: `${selectedScan.nutrition_data?.total_fat || 0}g`,           bold: true },
                      selectedScan.nutrition_data?.saturated_fat !== undefined && { label: 'Saturated Fat', val: `${selectedScan.nutrition_data.saturated_fat}g`, indent: true },
                      selectedScan.nutrition_data?.trans_fat !== undefined && { label: 'Trans Fat', val: `${selectedScan.nutrition_data.trans_fat}g`, indent: true },
                      selectedScan.nutrition_data?.cholesterol !== undefined && { label: 'Cholesterol', val: `${selectedScan.nutrition_data.cholesterol}mg` },
                      selectedScan.nutrition_data?.sodium !== undefined && { label: 'Sodium', val: `${selectedScan.nutrition_data.sodium}mg` },
                      { label: 'Total Carbs', val: `${selectedScan.nutrition_data?.total_carbohydrates || 0}g`,  bold: true },
                      selectedScan.nutrition_data?.dietary_fiber !== undefined && { label: 'Dietary Fiber', val: `${selectedScan.nutrition_data.dietary_fiber}g`, indent: true },
                      selectedScan.nutrition_data?.total_sugars !== undefined && { label: 'Total Sugars', val: `${selectedScan.nutrition_data.total_sugars}g`, indent: true },
                      { label: 'Protein',     val: `${selectedScan.nutrition_data?.protein || 0}g`,             bold: true },
                    ].filter(Boolean).map((row: any, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-2 ${row.indent ? 'pl-8' : ''}`}>
                        <span className={`text-sm ${row.bold ? 'font-bold text-[#1a231b]' : 'text-[#6b7e6d]'}`}>{row.label}</span>
                        <span className={`text-sm ${row.bold ? 'font-bold text-[#1a231b]' : 'text-[#6b7e6d]'}`}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Health Impacts */}
                {selectedScan.nutrition_data?.personal_health_impacts &&
                 selectedScan.nutrition_data.personal_health_impacts.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#3ecf66]">How This Affects You</h4>
                    <div className="space-y-2">
                      {selectedScan.nutrition_data.personal_health_impacts
                        .sort((a, b) => ({ danger: 0, warning: 1, caution: 2, safe: 3 }[a.impact_level] ?? 4) - ({ danger: 0, warning: 1, caution: 2, safe: 3 }[b.impact_level] ?? 4))
                        .map((impact, i) => {
                          const c = getImpactColor(impact.impact_level)
                          return (
                            <div key={i} className="rounded-2xl border p-4" style={{ background: c.bg, borderColor: c.border }}>
                              <div className="mb-2 flex items-center gap-2">
                                <span style={{ color: c.icon }}>{getImpactIcon(impact.impact_level)}</span>
                                <span className="text-sm font-bold" style={{ color: c.text }}>{impact.condition}</span>
                                <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                                  {impact.impact_level}
                                </span>
                              </div>
                              <p className="text-xs text-[#6b7e6d]">{impact.explanation}</p>
                              {impact.ingredients_of_concern?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {impact.ingredients_of_concern.map((ing, j) => (
                                    <span key={j} className="rounded-lg px-2 py-0.5 text-[10px] font-semibold" style={{ background: c.bg, color: c.text }}>
                                      {ing}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-[#3ecf66]">Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScan.ingredients?.map((ing, i) => (
                      <span
                        key={i}
                        className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#6b7e6d]"
                        style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Health Insights */}
                {selectedScan.nutrition_data?.health_insights && selectedScan.nutrition_data.health_insights.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-[#3ecf66]">Health Insights</h4>
                    <ul className="space-y-2 text-sm text-[#6b7e6d]">
                      {selectedScan.nutrition_data.health_insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#3ecf66]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDelete(selectedScan.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#ef4444] transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 8px #becea5, -2px -2px 6px #ffffff' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
