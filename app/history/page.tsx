'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar } from 'lucide-react'
import { ScanDetailsDialog, type FoodScan } from '@/components/scan-details-dialog'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:     '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
}

function getHealthColor(score: number) {
  if (score >= 80) return '#3ecf66'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#ec4899'
  return '#ef4444'
}

export default function HistoryPage() {
  const [scans, setScans] = useState<any[]>([])
  const [selectedScan, setSelectedScan] = useState<FoodScan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('food_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)
        setScans(data || [])
      } catch (err) {
        console.error('[v0] Error fetching history:', err)
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

  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl px-3" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
          <Link href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}
          >
            <ChevronLeft className="h-5 w-5 text-[#6b7e6d]" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-black text-[#1a231b]">Scan History</h1>
            <p className="text-[10px] font-medium text-[#6b7e6d]">All your food scans</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <Calendar className="h-4 w-4 text-[#6b7e6d]" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full items-center gap-4 rounded-2xl p-3"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              >
                {/* Thumbnail skeleton */}
                <div
                  className="h-16 w-16 flex-shrink-0 animate-pulse rounded-xl bg-[#d5dfd6]"
                />
                {/* Text skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-3/5 animate-pulse rounded bg-[#d5dfd6]" />
                  <div className="h-3 w-2/5 animate-pulse rounded bg-[#d5dfd6]" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-[#d5dfd6]" />
                </div>
                {/* Score skeleton */}
                <div className="flex-shrink-0 space-y-1 text-right">
                  <div className="ml-auto h-6 w-10 animate-pulse rounded-lg bg-[#d5dfd6]" />
                  <div className="ml-auto h-2.5 w-6 animate-pulse rounded bg-[#d5dfd6]" />
                </div>
                {/* Chevron skeleton */}
                <div className="h-4 w-4 animate-pulse rounded bg-[#d5dfd6]" />
              </div>
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: '#eaf0eb', boxShadow: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff' }}>
              <Calendar className="h-9 w-9 text-[#3ecf66] opacity-50" />
            </div>
            <div>
              <p className="mb-1 text-base font-bold text-[#1a231b]">No scans yet</p>
              <p className="text-sm text-[#6b7e6d]">Start scanning food to build your history</p>
            </div>
            <Link href="/scan"
              className="mt-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 8px #becea5, -2px -2px 6px #ffffff' }}>
              Start Scanning
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className="group flex w-full items-center gap-4 text-left rounded-2xl p-3 transition-all duration-200 active:scale-[0.99]"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '10px 10px 24px #bec7bf, -10px -10px 24px #ffffff')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = neu.sm)}
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl"
                  style={{ boxShadow: 'inset 2px 2px 6px #c4ccc5, inset -2px -2px 6px #ffffff' }}>
                  {scan.image_url ? (
                    <Image src={scan.image_url} alt={scan.food_name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: '#eaf0eb' }}>
                      <svg className="h-7 w-7 opacity-30" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="1.5">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-[#1a231b]">{scan.food_name}</p>
                  <p className="mt-0.5 text-xs text-[#6b7e6d]">
                    {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {scan.nutrition_data?.calories && (
                    <p className="mt-1 text-xs font-semibold text-[#3ecf66]">
                      {scan.nutrition_data.calories} kcal
                    </p>
                  )}
                </div>

                {/* Health score */}
                {scan.health_score && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-black" style={{ color: getHealthColor(scan.health_score) }}>
                      {scan.health_score}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[#6b7e6d]">/100</p>
                  </div>
                )}

                <ChevronLeft className="h-4 w-4 rotate-180 text-[#6b7e6d] transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Render the unified details modal */}
      <ScanDetailsDialog
        scan={selectedScan}
        onClose={() => setSelectedScan(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
