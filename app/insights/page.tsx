'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft, Lightbulb, TrendingUp } from 'lucide-react'
import { InsightsMetrics } from '@/components/insights-metrics'
import { WeeklyCalorieChart } from '@/components/weekly-calorie-chart'
import { HealthScoreDistribution } from '@/components/health-score-distribution'
import { NutritionSummary } from '@/components/nutrition-summary'
import { RecentScansList } from '@/components/recent-scans-list'

function InsightsContent() {
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
    ? Math.round(scans.reduce((sum, s) => sum + (s.nutrition_data?.calories || 0), 0) / scans.length)
    : 0
  const avgProtein = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + (s.nutrition_data?.protein || 0), 0) / scans.length)
    : 0

  // Calculate weekly data
  const getWeeklyData = () => {
    const weekData: { [key: string]: number } = {}
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = dayNames[date.getDay()]
      weekData[dayName] = 0
    }

    // Sum calories by day
    scans.forEach(scan => {
      const scanDate = new Date(scan.created_at)
      const dayName = dayNames[scanDate.getDay()]
      const dayKey = Object.keys(weekData).find(key => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - Object.keys(weekData).indexOf(key)))
        return date.getDay() === scanDate.getDay() && date.toDateString() === scanDate.toDateString()
      })
      if (dayKey) weekData[dayKey] += scan.nutrition_data?.calories || 0
    })

    return Object.entries(weekData).map(([day, calories]) => ({
      day,
      calories: Math.round(calories)
    }))
  }

  // Calculate health score distribution
  const getHealthScoreDistribution = () => {
    const distribution = { excellent: 0, good: 0, moderate: 0, poor: 0 }
    scans.forEach(scan => {
      const score = scan.health_score
      if (score >= 80) distribution.excellent++
      else if (score >= 60) distribution.good++
      else if (score >= 40) distribution.moderate++
      else distribution.poor++
    })
    
    return [
      { name: 'Excellent (80+)', value: distribution.excellent, color: '#10b981' },
      { name: 'Good (60-79)', value: distribution.good, color: '#3b82f6' },
      { name: 'Moderate (40-59)', value: distribution.moderate, color: '#f59e0b' },
      { name: 'Poor (<40)', value: distribution.poor, color: '#ef4444' }
    ].filter(item => item.value > 0)
  }

  // Calculate average health score
  const avgHealthScore = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + s.health_score, 0) / scans.length)
    : 0

  // Calculate total calories this week
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekCalories = scans
    .filter(s => new Date(s.created_at) >= weekAgo)
    .reduce((sum, s) => sum + (s.nutrition_data?.calories || 0), 0)

  const weeklyData = getWeeklyData()
  const healthScoreData = getHealthScoreDistribution()

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading insights...</div>
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium">No data yet</p>
            <p className="text-sm text-muted-foreground">Scan some food to see insights</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Row - Fast load */}
          <InsightsMetrics 
            totalScans={totalScans}
            avgHealthScore={avgHealthScore}
            avgCalories={avgCalories}
            weekCalories={weekCalories}
          />

          {/* Nutrition Summary - Fast load */}
          <NutritionSummary 
            avgCalories={avgCalories}
            avgProtein={avgProtein}
            totalScans={totalScans}
            avgHealthScore={avgHealthScore}
          />

          {/* Weekly Calorie Chart - Lazy loaded */}
          <Suspense fallback={<div className="h-80 rounded-xl border border-border/50 bg-card p-5 animate-pulse" />}>
            <WeeklyCalorieChart data={weeklyData} />
          </Suspense>

          {/* Health Score Distribution - Lazy loaded */}
          <Suspense fallback={<div className="h-64 rounded-xl border border-border/50 bg-card p-5 animate-pulse" />}>
            <HealthScoreDistribution data={healthScoreData} />
          </Suspense>

          {/* Recent Scans - Lazy loaded */}
          <Suspense fallback={<div className="h-48 rounded-xl animate-pulse" />}>
            <RecentScansList scans={scans} />
          </Suspense>
        </div>
      )}
    </>
  )
}

export default function InsightsPage() {
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
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-32 rounded-xl bg-muted animate-pulse" />
            <div className="h-48 rounded-xl bg-muted animate-pulse" />
          </div>
        }>
          <InsightsContent />
        </Suspense>
      </main>
    </div>
  )
}
