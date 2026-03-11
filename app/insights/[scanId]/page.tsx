'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Share2, Bookmark, Download, AlertCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react'

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
    serving_size: string
    calories: number
    total_fat: number
    saturated_fat: number
    trans_fat: number
    cholesterol: number
    sodium: number
    total_carbohydrates: number
    dietary_fiber: number
    total_sugars: number
    added_sugars: number
    protein: number
    vitamin_d: number
    calcium: number
    iron: number
    potassium: number
    health_insights: string[]
    recommendations: string[]
    personal_health_impacts?: PersonalHealthImpact[]
  }
  health_score: number
  health_rating: string
  created_at: string
}

export default function InsightsPage({ params }: { params: { scanId: string } }) {
  const router = useRouter()
  const [scan, setScan] = useState<FoodScan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchScan = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('food_scans')
        .select('*')
        .eq('id', params.scanId)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setScan(data)
      setIsLoading(false)
    }

    fetchScan()
  }, [params.scanId, router])

  const handleShare = async () => {
    if (navigator.share && scan) {
      try {
        await navigator.share({
          title: `${scan.food_name} - NutriScan Analysis`,
          text: `Health Score: ${scan.health_score}/100 | Calories: ${scan.nutrition_data.calories} kcal`,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    }
  }

  const handleDownload = () => {
    if (!scan) return
    const text = generateReport()
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', `${scan.food_name}_analysis.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const generateReport = () => {
    if (!scan) return ''
    return `
NutriScan Analysis Report
========================

Food: ${scan.food_name}
Date: ${new Date(scan.created_at).toLocaleDateString()}

HEALTH SCORE
Health Score: ${scan.health_score}/100
Rating: ${scan.health_rating}

NUTRITION FACTS (per ${scan.nutrition_data.serving_size})
Calories: ${scan.nutrition_data.calories} kcal
Protein: ${scan.nutrition_data.protein}g
Carbohydrates: ${scan.nutrition_data.total_carbohydrates}g
Fat: ${scan.nutrition_data.total_fat}g
Fiber: ${scan.nutrition_data.dietary_fiber}g
Sugars: ${scan.nutrition_data.total_sugars}g

INGREDIENTS
${scan.ingredients.join('\n')}

HEALTH INSIGHTS
${scan.nutrition_data.health_insights?.join('\n') || 'No insights available'}

RECOMMENDATIONS
${scan.nutrition_data.recommendations?.join('\n') || 'No recommendations available'}
    `
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Loading scan details...</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-medium">Scan not found</p>
          <Link href="/dashboard" className="mt-4 text-primary hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-600', badge: 'bg-green-500' }
    if (score >= 60) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600', badge: 'bg-blue-500' }
    if (score >= 40) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-600', badge: 'bg-yellow-500' }
    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600', badge: 'bg-red-500' }
  }

  const healthColor = getHealthColor(scan.health_score)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Link>
          <h1 className="text-lg font-bold">Scan Details</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Food Image and Header */}
        <Card className="mb-6 overflow-hidden border-border/50 bg-card">
          <div className="relative aspect-video w-full bg-muted">
            {scan.image_url ? (
              <Image
                src={scan.image_url}
                alt={scan.food_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">{scan.food_name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scanned on {new Date(scan.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Score Card */}
        <Card className={`mb-6 border-2 ${healthColor.border} ${healthColor.bg}`}>
          <CardHeader>
            <CardTitle className="text-lg">Health Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Health Score</p>
                <p className={`text-5xl font-bold ${healthColor.text}`}>
                  {scan.health_score}
                  <span className="text-xl font-normal">/100</span>
                </p>
                <p className="mt-2 text-sm font-medium capitalize">
                  Rating: {scan.health_rating.replace(/_/g, ' ')}
                </p>
              </div>
              <div className={`flex h-32 w-32 items-center justify-center rounded-full ${healthColor.badge} text-4xl font-bold text-white`}>
                {Math.round((scan.health_score / 100) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Health Impacts */}
        {scan.nutrition_data.personal_health_impacts && scan.nutrition_data.personal_health_impacts.length > 0 && (() => {
          const getScore = (level: string) => ({ safe: 2, caution: 4, warning: 7, danger: 9 }[level] ?? 5)
          const getLabel = (s: number) => s <= 3 ? 'Low Risk' : s <= 5 ? 'Moderate' : s <= 7 ? 'High Risk' : 'Avoid'
          const getColor = (level: string) => ({
            safe:    { text: '#2bb554', bg: 'rgba(62,207,102,0.12)',  border: 'rgba(62,207,102,0.3)',  dot: '#3ecf66' },
            caution: { text: '#b39c00', bg: 'rgba(245,217,10,0.12)',  border: 'rgba(245,217,10,0.3)',  dot: '#f5d90a' },
            warning: { text: '#cc8d1a', bg: 'rgba(255,176,32,0.12)',  border: 'rgba(255,176,32,0.3)',  dot: '#ffb020' },
            danger:  { text: '#dc2626', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   dot: '#ff4b4b' },
          }[level] ?? { text: '#6b7e6d', bg: 'rgba(107,126,109,0.08)', border: 'rgba(107,126,109,0.2)', dot: '#6b7e6d' })
          return (
            <Card className="mb-6 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Personal Health Profile Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-border/40">
                {scan.nutrition_data.personal_health_impacts
                  .sort((a, b) => ({ danger: 0, warning: 1, caution: 2, safe: 3 }[a.impact_level] ?? 4) - ({ danger: 0, warning: 1, caution: 2, safe: 3 }[b.impact_level] ?? 4))
                  .map((impact, i) => {
                    const score = getScore(impact.impact_level)
                    const percent = ((score - 1) / 9) * 100
                    const c = getColor(impact.impact_level)
                    const oneLiner = (() => {
                      const first = impact.explanation.split(/\.\s/)[0].replace(/\.$/, '')
                      return first.length > 90 ? first.slice(0, 87) + '…' : first
                    })()
                    return (
                      <div key={i} className="flex flex-col gap-2 py-4">
                        {/* Top row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm">{impact.condition}</span>
                          <span
                            className="text-[11px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full shrink-0"
                            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                          >
                            {getLabel(score)}
                          </span>
                        </div>
                        {/* 1-liner */}
                        <p className="text-sm text-muted-foreground">{oneLiner}.</p>
                        {/* Scale bar */}
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">1</span>
                          <div className="relative flex-1 h-2 rounded-full overflow-visible bg-muted">
                            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #22c55e, #eab308 40%, #f97316 65%, #ef4444)' }} />
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background shadow-md"
                              style={{ left: `calc(${percent}% - 8px)`, background: c.dot }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">10</span>
                          <span className="text-xs font-black shrink-0 w-8 text-right">{score}/10</span>
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          )
        })()}

        {/* Nutrition Facts */}
        <Card className="mb-6 border-border/50">
          <CardHeader>
            <CardTitle>Nutrition Facts</CardTitle>
            <p className="text-xs text-muted-foreground">Per serving: {scan.nutrition_data.serving_size}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Calories', value: scan.nutrition_data.calories, unit: 'kcal' },
                { label: 'Protein', value: scan.nutrition_data.protein, unit: 'g' },
                { label: 'Carbs', value: scan.nutrition_data.total_carbohydrates, unit: 'g' },
                { label: 'Fat', value: scan.nutrition_data.total_fat, unit: 'g' },
              ].map((nutrient) => (
                <div key={nutrient.label} className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{nutrient.value}</p>
                  <p className="text-xs text-muted-foreground">{nutrient.label}</p>
                  <p className="text-xs font-medium">{nutrient.unit}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Saturated Fat</span>
                <span className="font-medium">{scan.nutrition_data.saturated_fat}g</span>
              </div>
              <div className="flex justify-between">
                <span>Cholesterol</span>
                <span className="font-medium">{scan.nutrition_data.cholesterol}mg</span>
              </div>
              <div className="flex justify-between">
                <span>Sodium</span>
                <span className="font-medium">{scan.nutrition_data.sodium}mg</span>
              </div>
              <div className="flex justify-between">
                <span>Dietary Fiber</span>
                <span className="font-medium">{scan.nutrition_data.dietary_fiber}g</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sugars</span>
                <span className="font-medium">{scan.nutrition_data.total_sugars}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="mb-6 border-border/50">
          <CardHeader>
            <CardTitle>Identified Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scan.ingredients.map((ing, i) => (
                <Badge key={i} variant="secondary">
                  {ing}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Insights */}
        {scan.nutrition_data.health_insights && scan.nutrition_data.health_insights.length > 0 && (
          <Card className="mb-6 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scan.nutrition_data.health_insights.map((insight, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {scan.nutrition_data.recommendations && scan.nutrition_data.recommendations.length > 0 && (
          <Card className="mb-6 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scan.nutrition_data.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-accent">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
