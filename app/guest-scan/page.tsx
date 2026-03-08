'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CameraCapture } from '@/components/camera-capture'
import { AnalysisQuestions } from '@/components/analysis-questions'
import Link from 'next/link'
import Image from 'next/image'
import { useGuestSession } from '@/hooks/use-guest-session'

interface Question {
  id: string
  question: string
  type?: string
  options: string[]
  allow_specify?: boolean
  specify_placeholder?: string
}

interface InitialAnalysis {
  food_name: string
  ingredients: string[]
  serving_size: string
  confidence: string
  is_labeled_product?: boolean
  questions: Question[]
}

interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

interface NutritionData {
  food_name: string
  ingredients: string[]
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
  health_score: number
  health_rating: string
  health_insights: string[]
  recommendations: string[]
  personal_health_impacts?: PersonalHealthImpact[]
}

type ScanStep = 'capture' | 'analyzing' | 'questions' | 'calculating' | 'results'

export default function GuestScanPage() {
  const router = useRouter()
  const { guestId, saveToGuestSession, isLoading: sessionLoading } = useGuestSession()
  
  const [step, setStep] = useState<ScanStep>('capture')
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('image/jpeg')
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageCapture = async (imageData: string, type: string) => {
    setCapturedImage(imageData)
    setMimeType(type)
    setShowCamera(false)
    setError(null)
    setStep('analyzing')

    try {
      const response = await fetch(`/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageData, 
          mime_type: type,
          health_profile: null // Guest has no health profile
        }),
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const data: InitialAnalysis = JSON.parse(responseText)
      
      // Force allow_specify for all questions
      if (data.questions && data.questions.length > 0) {
        data.questions = data.questions.map(q => ({
          ...q,
          allow_specify: true,
          specify_placeholder: q.specify_placeholder || "Please specify details..."
        }))
      }

      setInitialAnalysis(data)
      
      if (data.questions && data.questions.length > 0) {
        setStep('questions')
      } else {
        handleQuickAnalysis(imageData, type)
      }
    } catch (err) {
      setError(`Failed to analyze the image: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStep('capture')
    }
  }

  const handleQuickAnalysis = async (imageData: string, type: string) => {
    setStep('calculating')
    try {
      const response = await fetch(`${API_BASE_URL}/api/quick-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageData, 
          mime_type: type,
          health_profile: null // Guest has no health profile
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate nutrition')
      }

      const data: NutritionData = await response.json()
      setNutritionData(data)
      setStep('results')
    } catch {
      setError('Failed to calculate nutrition. Please try again.')
      setStep('capture')
    }
  }

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!initialAnalysis) return

    setError(null)
    setStep('calculating')
    
    try {
      const response = await fetch(`/api/calculate-nutrition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: initialAnalysis.food_name,
          initial_ingredients: initialAnalysis.ingredients,
          answers,
          health_profile: null, // Guest has no health profile
          guest_id: guestId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate nutrition')
      }

      const data: NutritionData = await response.json()
      setNutritionData(data)
      
      // Save scan to guest session
      if (guestId && data) {
        await saveToGuestSession({
          food_name: data.food_name,
          nutrition_data: data,
          created_at: new Date().toISOString(),
        })
      }
      
      setStep('results')
    } catch {
      setError('Failed to calculate nutrition. Please try again.')
      setStep('questions')
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setInitialAnalysis(null)
    setNutritionData(null)
    setError(null)
    setStep('capture')
  }

  const handleSignUp = () => {
    router.push('/auth/sign-up?redirect=/dashboard')
  }

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="pointer-events-none fixed -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl sm:-bottom-32 sm:-left-32 sm:h-96 sm:w-96" />
      <div className="pointer-events-none fixed -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl sm:-right-32 sm:-top-32 sm:h-96 sm:w-96" />
      
      {/* Guest Banner */}
      <div className="sticky top-0 z-40 border-b border-border/10 bg-primary/10 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary sm:text-sm">👋 Trying as guest</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignUp}
            className="h-auto px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 sm:text-sm"
          >
            Sign up free →
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-[44px] sm:top-[52px] z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl safe-area-inset-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          <Link 
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-primary/10 active:bg-primary/20 sm:h-10 sm:w-10"
            aria-label="Go back home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center text-base font-bold sm:text-lg">Guest Scan</h1>
          <div className="w-11 sm:w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:p-4">
            {error}
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card sm:rounded-2xl">
              {capturedImage ? (
                <div className="relative aspect-[4/3] sm:aspect-video">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-background/80 px-2.5 py-1 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5">
                    <svg className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Ready to Scan</span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-card/50 sm:aspect-video sm:gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 sm:h-20 sm:w-20 sm:rounded-2xl">
                    <svg className="h-8 w-8 text-primary/60 sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-semibold sm:text-base">No image captured yet</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">Take a photo or upload an image</p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              onClick={() => setShowCamera(true)}
              className="h-14 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] sm:h-16 sm:rounded-2xl sm:text-lg sm:hover:-translate-y-0.5"
            >
              <svg className="mr-2 h-5 w-5 sm:mr-3 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Take Photo
            </Button>

            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignUp}
                className="text-xs text-muted-foreground hover:text-primary sm:text-sm"
              >
                Sign up to save scans →
              </Button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 sm:h-24 sm:w-24">
                <svg className="h-10 w-10 animate-pulse text-primary sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-center text-lg font-bold sm:text-xl">Analyzing your food...</h2>
            <p className="text-center text-sm text-muted-foreground sm:text-base">Our AI is identifying ingredients</p>
          </div>
        )}

        {step === 'questions' && initialAnalysis && (
          <div className="space-y-4 sm:space-y-6">
            {capturedImage && (
              <div className="relative mx-auto w-32 overflow-hidden rounded-lg border-2 border-primary/30 shadow-lg shadow-primary/10 sm:w-48 sm:rounded-xl">
                <div className="aspect-square">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm sm:bottom-2 sm:left-2 sm:rounded-lg sm:px-2 sm:py-1">
                  <svg className="h-2.5 w-2.5 text-primary sm:h-3 sm:w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="max-w-[80px] truncate text-[8px] font-bold uppercase sm:max-w-none sm:text-[10px]">Detected: {initialAnalysis.food_name}</span>
                </div>
              </div>
            )}
            <AnalysisQuestions
              foodName={initialAnalysis.food_name}
              questions={initialAnalysis.questions}
              onSubmit={handleQuestionsSubmit}
              isLoading={false} 
            />
          </div>
        )}

        {step === 'calculating' && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 sm:h-24 sm:w-24">
                <svg className="h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-center text-lg font-bold sm:text-xl">Calculating nutrition...</h2>
            <p className="text-center text-sm text-muted-foreground sm:text-base">Building your nutrition profile</p>
          </div>
        )}

        {step === 'results' && nutritionData && (
          <GuestNutritionResults
            data={nutritionData}
            onSignUp={handleSignUp}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Guest Bottom Navigation */}
      <nav className="sticky bottom-0 border-t border-border/10 bg-background/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-lg sm:px-4 sm:pb-6 sm:pt-2">
        <div className="mx-auto flex max-w-2xl justify-around">
          <Link 
            href="/" 
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-muted-foreground/60 transition-colors hover:text-foreground active:bg-primary/10 sm:min-w-[64px] sm:gap-1 sm:px-3 sm:py-2"
            aria-label="Go to Home"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">Home</span>
          </Link>
          <div 
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-primary sm:min-w-[64px] sm:gap-1 sm:px-3 sm:py-2"
            aria-current="page"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m9.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <path d="m14.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <circle cx="12" cy="13" r="3" fill="var(--background)" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">Scan</span>
          </div>
          <button 
            onClick={handleSignUp}
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-muted-foreground/60 transition-colors hover:text-foreground active:bg-primary/10 sm:min-w-[64px] sm:gap-1 sm:px-3 sm:py-2"
            aria-label="Sign up for free"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">Sign Up</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

// Guest-specific nutrition results component with sign-up upsell instead of save
function GuestNutritionResults({
  data,
  onSignUp,
  onReset,
}: {
  data: NutritionData
  onSignUp: () => void
  onReset: () => void
}) {
  const { Badge } = require('@/components/ui/badge')
  const { Card, CardContent, CardHeader, CardTitle } = require('@/components/ui/card')
  const { Button: UIButton } = require('@/components/ui/button')
  const { Progress } = require('@/components/ui/progress')
  const { Separator } = require('@/components/ui/separator')
  const {
    Flame,
    Droplets,
    Wheat,
    Beef,
    Heart,
    ShieldCheck,
    AlertTriangle,
    ShieldAlert,
    CircleX,
  } = require('lucide-react')

  function getHealthColor(score: number): string {
    if (score >= 80) return 'bg-green-500 text-white'
    if (score >= 60) return 'bg-blue-500 text-white'
    if (score >= 40) return 'bg-yellow-500 text-white'
    return 'bg-red-500 text-white'
  }

  function getProgressColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  function getImpactIcon(level: string) {
    switch (level) {
      case 'safe':
        return <ShieldCheck className="h-5 w-5 text-green-500" />
      case 'caution':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'warning':
        return <ShieldAlert className="h-5 w-5 text-orange-500" />
      case 'danger':
        return <CircleX className="h-5 w-5 text-red-500" />
    }
  }

  function getImpactBgColor(level: string): string {
    switch (level) {
      case 'safe':
        return 'bg-green-500/10 border-green-500/30'
      case 'caution':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30'
      case 'danger':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  return (
    <div className="space-y-6 pb-6 sm:pb-8">
      {/* Upsell Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <h2 className="mb-1 font-bold sm:text-lg">Want personalized insights?</h2>
            <p className="mb-3 text-sm text-muted-foreground">Sign up free to unlock allergy warnings, save meals, and track your nutrition over time.</p>
            <Button
              onClick={onSignUp}
              className="w-full bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 sm:w-auto"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </div>

      {/* Food Name & Overall Health Score */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="mb-2 text-2xl sm:text-3xl">{data.food_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{data.serving_size}</p>
            </div>
            <div className={`rounded-2xl px-4 py-2 font-bold text-white ${getHealthColor(data.health_score)}`}>
              <div className="text-2xl">{Math.round(data.health_score)}</div>
              <div className="text-xs">{data.health_rating}</div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Health Score</span>
              <span className="font-semibold">{Math.round(data.health_score)}%</span>
            </div>
            <Progress value={data.health_score} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Macros */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Nutrition Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <div className="flex justify-center mb-2">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{Math.round(data.calories)}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>

            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <div className="flex justify-center mb-2">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{Math.round(data.protein)}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>

            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <div className="flex justify-center mb-2">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{Math.round(data.total_carbohydrates)}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>

            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <div className="flex justify-center mb-2">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{Math.round(data.total_fat)}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Saturated Fat</span>
              <span className="font-semibold">{Math.round(data.saturated_fat)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trans Fat</span>
              <span className="font-semibold">{Math.round(data.trans_fat)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cholesterol</span>
              <span className="font-semibold">{Math.round(data.cholesterol)}mg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sodium</span>
              <span className="font-semibold">{Math.round(data.sodium)}mg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dietary Fiber</span>
              <span className="font-semibold">{Math.round(data.dietary_fiber)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sugars</span>
              <span className="font-semibold">{Math.round(data.total_sugars)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Added Sugars</span>
              <span className="font-semibold">{Math.round(data.added_sugars)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Potassium</span>
              <span className="font-semibold">{Math.round(data.potassium)}mg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {data.health_insights && data.health_insights.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Health Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.health_insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <Heart className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSignUp}
          className="flex-1 h-12 bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          Sign Up Free
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 h-12"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Scan Again
        </Button>
      </div>
    </div>
  )
}

// Re-export the CheckCircle icon that's used in the component
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
