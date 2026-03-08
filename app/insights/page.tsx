'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Lightbulb, TrendingUp, TrendingDown, Activity, Flame } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  const healthScoreDistribution = () => {
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
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Scans</p>
                <p className="mt-2 text-3xl font-bold text-primary">{totalScans}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Health Score</p>
                <p className="mt-2 text-3xl font-bold text-emerald-500">{avgHealthScore}</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Calories</p>
                <p className="mt-2 text-3xl font-bold text-orange-500">{avgCalories}</p>
                <p className="text-xs text-muted-foreground">per scan</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weekly Total</p>
                <p className="mt-2 text-3xl font-bold text-blue-500">{weekCalories}</p>
                <p className="text-xs text-muted-foreground">calories</p>
              </div>
            </div>

            {/* Weekly Calorie Chart */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-semibold">Weekly Calorie Consumption</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value} kcal`, 'Calories']}
                  />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Health Score Distribution */}
            {healthScoreDistribution().length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 font-semibold">Health Score Distribution</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={healthScoreDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {healthScoreDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center gap-3">
                    {healthScoreDistribution().map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.value} scans</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-semibold">Nutrition Summary (Average)</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Calories', value: avgCalories, unit: 'kcal', icon: '🔥' },
                  { label: 'Protein', value: avgProtein, unit: 'g', icon: '💪' },
                  { label: 'Scans', value: totalScans, unit: '', icon: '📊' },
                  { label: 'Health Score', value: avgHealthScore, unit: '/100', icon: '❤️' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center rounded-lg bg-muted/50 p-3">
                    <span className="mb-2 text-xl">{item.icon}</span>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.unit && <p className="text-xs text-muted-foreground">{item.unit}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Scans */}
            <div>
              <h2 className="mb-4 font-semibold">Recent Scans</h2>
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
                      <p className="font-semibold">{scan.nutrition_data?.calories || 0}</p>
                      <p className="text-xs text-muted-foreground">cal</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
