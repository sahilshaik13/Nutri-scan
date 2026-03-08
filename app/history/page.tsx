'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar, Flame } from 'lucide-react'

export default function HistoryPage() {
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
          .limit(100)

        setScans(data || [])
      } catch (error) {
        console.error('[v0] Error fetching history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScans()
  }, [])

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
              <h1 className="text-lg font-bold">Scan History</h1>
              <p className="text-xs text-muted-foreground">All your food scans</p>
            </div>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading history...</div>
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-medium">No scans yet</p>
              <p className="text-sm text-muted-foreground">Start scanning food to build your history</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/insights/${scan.id}`}
                className="group flex gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
              >
                {scan.image_url && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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
                  {scan.total_calories && (
                    <div className="mt-1 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-medium">{scan.total_calories} cal</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
