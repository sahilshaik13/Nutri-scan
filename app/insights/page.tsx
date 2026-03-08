'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart'

interface FoodScan {
  id: string
  food_name: string
  nutrition_data: {
    calories: number
    protein: number
    total_carbohydrates: number
    total_fat: number
  }
  health_score: number
  created_at: string
}

export default function InsightsPage() {
  const router = useRouter()
  const [scans, setScans] = useState<FoodScan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScans = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('food_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setScans(data)
      }
      setIsLoading(false)
    }

    fetchScans()
  }, [router])

  const getWeeklyData = () => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weekData: Record<string, { day: string; calories: number; healthScore: number; count: number }> = {}
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dateString = date.toDateString()
      
      weekData[dateString] = {
        day: dayName,
        calories: 0,
        healthScore: 0,
        count: 0,
      }
    }

    scans.forEach(scan => {
      const scanDate = new Date(scan.created_at).toDateString()
      if (weekData[scanDate]) {
        weekData[scanDate].calories += scan.nutrition_data?.calories || 0
        weekData[scanDate].healthScore += scan.health_score || 0
        weekData[scanDate].count += 1
      }
    })

    return Object.values(weekData).map(item => ({
      ...item,
      healthScore: item.count > 0 ? Math.round(item.healthScore / item.count) : 0,
    }))
  }

  const getTotalStats = () => {
    const totalCalories = scans.reduce((sum, scan) => sum + (scan.nutrition_data?.calories || 0), 0)
    const avgHealthScore = scans.length > 0 ? Math.round(scans.reduce((sum, scan) => sum + scan.health_score, 0) / scans.length) : 0
    const totalProtein = scans.reduce((sum, scan) => sum + (scan.nutrition_data?.protein || 0), 0)
    const totalCarbs = scans.reduce((sum, scan) => sum + (scan.nutrition_data?.total_carbohydrates || 0), 0)
    const totalFat = scans.reduce((sum, scan) => sum + (scan.nutrition_data?.total_fat || 0), 0)
    
    return {
      totalCalories,
      avgHealthScore,
      totalProtein,
      totalCarbs,
      totalFat,
    }
  }

  const getMacroData = () => {
    const stats = getTotalStats()
    return [
      { name: 'Protein', value: Math.round(stats.totalProtein), color: '#3b82f6' },
      { name: 'Carbs', value: Math.round(stats.totalCarbs), color: '#f59e0b' },
      { name: 'Fat', value: Math.round(stats.totalFat), color: '#ef4444' },
    ]
  }

  const getHealthScoreCategory = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Moderate'
    return 'Poor'
  }

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-primary'
    if (score >= 60) return 'text-chart-2'
    if (score >= 40) return 'text-chart-4'
    return 'text-chart-5'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <svg className="h-8 w-8 animate-pulse text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
  }

  const weeklyData = getWeeklyData()
  const stats = getTotalStats()
  const macroData = getMacroData()

  return (
    <div className="flex min-h-svh flex-col bg-background pb-28">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="rounded-xl bg-primary p-1.5 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <svg
                className="h-5 w-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">NutriScan</span>
          </Link>
          <h1 className="text-lg font-bold">Insights</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        {scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="h-10 w-10 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3v18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4L9 3z" />
                <path d="M9 9h6M9 13h4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">No data yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-md">
              Start scanning food to see detailed insights about your nutritional habits and health trends
            </p>
            <Link
              href="/scan"
              className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Scan Your First Food
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Health Score Overview */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Health Score</h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <div className={`text-5xl font-bold ${getHealthScoreColor(stats.avgHealthScore)}`}>
                    {stats.avgHealthScore}
                  </div>
                  <p className="text-sm text-muted-foreground">out of 10</p>
                </div>
                <div className="flex-1 rounded-xl bg-background/50 p-4">
                  <p className="text-sm font-medium mb-2">Overall Status</p>
                  <p className={`text-lg font-bold ${getHealthScoreColor(stats.avgHealthScore)}`}>
                    {getHealthScoreCategory(stats.avgHealthScore)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {scans.length} food scan{scans.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly Calorie Intake */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Weekly Calorie Intake</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} kcal`, 'Calories']}
                    />
                    <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Health Scores */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Weekly Health Scores</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value}/100`, 'Health Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Macronutrient Distribution</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                  <div className="h-80 w-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}g`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => [`${value}g`, 'Total']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <p className="text-sm text-muted-foreground">Total Protein</p>
                    <p className="text-2xl font-bold text-chart-1">{Math.round(stats.totalProtein)}g</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <p className="text-sm text-muted-foreground">Total Carbohydrates</p>
                    <p className="text-2xl font-bold text-chart-2">{Math.round(stats.totalCarbs)}g</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <p className="text-sm text-muted-foreground">Total Fat</p>
                    <p className="text-2xl font-bold text-chart-3">{Math.round(stats.totalFat)}g</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Calories</p>
                <p className="mt-2 text-3xl font-bold">{Math.round(stats.totalCalories)} <span className="text-lg font-normal text-muted-foreground">kcal</span></p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Food Scans</p>
                <p className="mt-2 text-3xl font-bold">{scans.length}</p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Daily Calories</p>
                <p className="mt-2 text-3xl font-bold">{Math.round(stats.totalCalories / (weeklyData.filter(d => d.calories > 0).length || 1))} <span className="text-lg font-normal text-muted-foreground">kcal</span></p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/10 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl justify-around px-4">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
          </Link>
          <Link href="/insights" className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Insights</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
