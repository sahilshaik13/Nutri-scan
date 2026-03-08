'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Flame, Scale, TrendingUp, AlertTriangle, Lightbulb, Activity, ChevronRight, Target } from 'lucide-react'
import { ScanDetailsDialog, type FoodScan } from '@/components/scan-details-dialog'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:     '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:  'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

function getHealthColor(score: number) {
  if (score >= 80) return '#3ecf66'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#ec4899'
  return '#ef4444'
}

export default function InsightsPage() {
  const [scans, setScans] = useState<any[]>([])
  const [selectedScan, setSelectedScan] = useState<FoodScan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // Fetch last 30 days of scans for insights
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data } = await supabase
          .from('food_scans')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          
        setScans(data || [])
      } catch (err) {
        console.error('Error fetching insights data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchScans()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('food_scans').delete().eq('id', id)
    if (!error) {
      setScans(prev => prev.filter(s => s.id !== id))
      if (selectedScan?.id === id) setSelectedScan(null)
    }
  }

  // Basic Derived Stats
  const totalScans = scans.length
  const avgCalories = totalScans > 0 ? Math.round(scans.reduce((s, x) => s + (x.nutrition_data?.calories || 0), 0) / totalScans) : 0
  const avgProtein  = totalScans > 0 ? Math.round(scans.reduce((s, x) => s + (x.nutrition_data?.protein  || 0), 0) / totalScans) : 0
  const avgHealthScore = totalScans > 0 ? Math.round(scans.reduce((s, x) => s + x.health_score, 0) / totalScans) : 0

  // Weekly Trend
  const getWeeklyData = () => {
    const weekData: { [k: string]: number } = {}
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const datesMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const s = d.toDateString(); datesMap.set(s, i)
      weekData[dayNames[d.getDay()]] = 0
    }
    scans.forEach(scan => {
      const s = new Date(scan.created_at).toDateString()
      if (datesMap.has(s)) weekData[dayNames[new Date(scan.created_at).getDay()]] += scan.nutrition_data?.calories || 0
    })
    return Object.entries(weekData).map(([day, calories]) => ({ day, calories: Math.round(calories) }))
  }
  const weeklyData = getWeeklyData()
  const maxWeeklyCal = Math.max(...weeklyData.map(d => d.calories), 1)

  // Health Score Distribution
  const dist = scans.reduce((acc, s) => {
    if (s.health_score >= 80) acc.excellent++
    else if (s.health_score >= 60) acc.good++
    else if (s.health_score >= 40) acc.moderate++
    else acc.poor++
    return acc
  }, { excellent: 0, good: 0, moderate: 0, poor: 0 })

  const distItems = [
    { name: 'Excellent', val: dist.excellent, color: '#3ecf66' },
    { name: 'Good', val: dist.good, color: '#3b82f6' },
    { name: 'Moderate', val: dist.moderate, color: '#f59e0b' },
    { name: 'Poor', val: dist.poor, color: '#ef4444' },
  ]

  // Beautiful Skeleton View
  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
          .shimmer-effect {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: shimmer 1.5s infinite ease-in-out;
          }
        `}</style>
        
        {/* Header Skeleton */}
        <header className="sticky top-0 z-30 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl px-3" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <div className="h-9 w-9 rounded-xl bg-[#d5dfd6] overflow-hidden relative"><div className="shimmer-effect" /></div>
            <div className="h-4 w-24 rounded-full bg-[#d5dfd6] overflow-hidden relative"><div className="shimmer-effect" /></div>
            <div className="h-9 w-9 rounded-xl bg-[#d5dfd6] overflow-hidden relative"><div className="shimmer-effect" /></div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 rounded-3xl overflow-hidden relative bg-[#dde6de]" style={{ boxShadow: neu.sm }}><div className="shimmer-effect" /></div>
            <div className="h-32 rounded-3xl overflow-hidden relative bg-[#dde6de]" style={{ boxShadow: neu.sm }}><div className="shimmer-effect" style={{ animationDelay: '0.2s' }} /></div>
          </div>
          <div className="h-48 rounded-3xl overflow-hidden relative bg-[#dde6de]" style={{ boxShadow: neu.raised }}><div className="shimmer-effect" style={{ animationDelay: '0.4s' }} /></div>
          <div className="h-64 rounded-3xl overflow-hidden relative bg-[#dde6de]" style={{ boxShadow: neu.raised }}><div className="shimmer-effect" style={{ animationDelay: '0.6s' }} /></div>
        </main>
      </div>
    )
  }

  // Empty State
  if (scans.length === 0) {
    return (
      <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
        <header className="sticky top-0 z-30 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
          <div className="mx-auto flex h-14 max-w-lg items-center justify-between rounded-2xl px-3" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ boxShadow: neu.sm }}><ChevronLeft className="h-5 w-5 text-[#6b7e6d]" /></Link>
            <h1 className="text-base font-black text-[#1a231b]">Insights</h1>
            <div className="w-9" />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            <Lightbulb className="h-10 w-10 text-[#3ecf66] opacity-60" />
          </div>
          <h2 className="mt-6 text-xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>No data yet</h2>
          <p className="mt-2 text-center text-sm text-[#6b7e6d]">Scan some meals to start unlocking your personalized nutrition insights.</p>
          <Link href="/scan" className="mt-8 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 12px #becea5' }}>
            Scan Your First Meal
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-slide-up { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between rounded-2xl px-3" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
          <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <ChevronLeft className="h-5 w-5 text-[#6b7e6d]" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-black text-[#1a231b]">Trends & Insights</h1>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            <TrendingUp className="h-4 w-4 text-[#3ecf66]" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 space-y-6">
        
        {/* At a Glance Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="anim-slide-up rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised, animationDelay: '0.1s' }}>
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
              <Flame className="h-4 w-4 text-[#fb923c]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">Avg Calories</p>
            <p className="mt-1 text-2xl font-black text-[#1a231b]">{avgCalories}</p>
          </div>
          
          <div className="anim-slide-up rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised, animationDelay: '0.2s' }}>
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
              <Activity className="h-4 w-4" style={{ color: getHealthColor(avgHealthScore) }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">Avg Score</p>
            <p className="mt-1 text-2xl font-black text-[#1a231b]">
              {avgHealthScore}
              <span className="text-xs text-[#6b7e6d] font-semibold">/100</span>
            </p>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="anim-slide-up rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised, animationDelay: '0.3s' }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">7-Day Trend</p>
              <h2 className="text-lg font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Calories Consumed</h2>
            </div>
          </div>
          
          <div className="flex h-36 items-end justify-between gap-2">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div 
                  className="w-full max-w-[32px] rounded-full relative group transition-all duration-300" 
                  style={{ 
                    height: d.calories > 0 ? `${(d.calories / maxWeeklyCal) * 100}%` : '8%',
                    minHeight: '8px', 
                    background: d.calories > 0 ? 'linear-gradient(to top, #2bb554, #3ecf66)' : '#d5dfd6',
                    boxShadow: d.calories > 0 ? '2px 2px 5px #c4ccc5, inset -2px -2px 5px rgba(0,0,0,0.1)' : neu.inset
                  }}
                >
                  {/* Tooltip on tap/hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#1a231b] px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 pointer-events-none">
                    {d.calories}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#6b7e6d]">{d.day.charAt(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Score Distribution */}
        <div className="anim-slide-up rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised, animationDelay: '0.4s' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">Meal Quality Tracker</p>
          <h2 className="mt-1 text-lg font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>Health Distribution</h2>
          
          <div className="mt-6 space-y-4">
            {distItems.map(item => {
              const pct = totalScans > 0 ? Math.round((item.val / totalScans) * 100) : 0
              if (item.val === 0) return null
              return (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-xs font-bold text-[#1a231b]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                      {item.name}
                    </div>
                    <span>{pct}% <span className="text-[10px] text-[#6b7e6d] font-medium ml-1">({item.val})</span></span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Scans Subset */}
        <section className="mt-8 mb-6">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Recent Scans
            </h2>
          </div>
          <div className="space-y-3">
            {scans.slice(0, 3).map((scan) => (
              <button
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className="group flex w-full items-center gap-4 text-left rounded-2xl p-3 transition-all duration-200 active:scale-[0.99]"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '10px 10px 24px #bec7bf, -10px -10px 24px #ffffff')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = neu.sm)}
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl"
                  style={{ boxShadow: 'inset 2px 2px 5px #c4ccc5, inset -2px -2px 5px #ffffff' }}>
                  {scan.image_url ? (
                    <Image src={scan.image_url} alt={scan.food_name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#eaf0eb]">
                      <Activity className="h-6 w-6 text-[#3ecf66] opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-[#1a231b]">{scan.food_name}</p>
                  <p className="text-xs text-[#6b7e6d]">
                    {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {scan.health_score && (
                  <div className="flex flex-col items-end">
                    <span className="text-base font-black" style={{ color: getHealthColor(scan.health_score) }}>
                      {scan.health_score}
                    </span>
                    <span className="text-[10px] font-bold text-[#6b7e6d]">/100</span>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-[#6b7e6d] transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <ScanDetailsDialog
        scan={selectedScan}
        onClose={() => setSelectedScan(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
