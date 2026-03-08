'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Lightbulb, TrendingUp } from 'lucide-react'

export default function InsightsPage() {
  const [scans, setScans] = useState<any[]>([])
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

        setScans(data || [])
      } catch (error) {
        console.error('[v0] Error fetching insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScans()
  }, [])

  // Calculate health insights
  const totalScans = scans.length
  const avgCalories = scans.length > 0 
    ? Math.round(scans.reduce((sum, s) => sum + (s.total_calories || 0), 0) / scans.length)
    : 0
  const avgProtein = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + (s.protein_g || 0), 0) / scans.length)
    : 0

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/10 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-lg p-2 hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Insights</h1>
              <p className="text-xs text-muted-foreground">Your nutrition trends</p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading insights...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-center">
                <div className="text-2xl font-bold text-primary">{totalScans}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Scans</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-3 text-center">
                <div className="text-2xl font-bold text-orange-500">{avgCalories}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg Cal</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-3 text-center">
                <div className="text-2xl font-bold text-emerald-500">{avgProtein}g</div>
                <p className="text-xs text-muted-foreground mt-1">Avg Protein</p>
              </div>
            </div>

            {/* Recent Scans */}
            {scans.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="font-medium">No data yet</p>
                  <p className="text-sm text-muted-foreground">Scan some food to see insights</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-semibold mb-3">Recent Scans</h2>
                <div className="space-y-2">
                  {scans.slice(0, 10).map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/insights/${scan.id}`}
                      className="flex gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
                    >
                      {scan.image_url && (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={scan.image_url}
                            alt={scan.food_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{scan.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{scan.total_calories || 0}</p>
                        <p className="text-xs text-muted-foreground">cal</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
