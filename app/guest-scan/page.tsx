'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CameraCapture } from '@/components/camera-capture'
import { ImageUpload } from '@/components/image-upload'
import { AnalysisQuestions } from '@/components/analysis-questions'
import { NutritionResults } from '@/components/nutrition-results'
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
  
  // Backend API URL (port 8000)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nutri-scan-fvyo.onrender.com'
  
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
      const response = await fetch(`${API_URL}/api/analyze-image`, {
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
      const response = await fetch(`/api/quick-analyze`, {
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
      const response = await fetch(`${API_URL}/api/calculate-nutrition`, {
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
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
      {/* Guest Banner */}
      <div className="sticky top-0 z-50 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl px-4 py-2.5" style={{ background: 'rgba(62,207,102,0.08)', border: '1px solid rgba(62,207,102,0.2)' }}>
          <span className="text-xs font-bold text-[#3ecf66] sm:text-sm">👋 Trying as guest</span>
          <button
            onClick={handleSignUp}
            className="rounded-xl px-4 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)' }}
          >
            Sign up free →
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-[52px] z-40 px-4 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex h-12 max-w-2xl items-center gap-2 rounded-2xl px-4" style={{ background: '#eaf0eb', boxShadow: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff' }}>
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: '#eaf0eb', boxShadow: '3px 3px 6px #c4ccc5, -3px -3px 6px #ffffff' }}
            aria-label="Go back home"
          >
            <svg className="h-4 w-4 text-[#6b7e6d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center text-base font-black text-[#1a231b]">Guest Scan</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {error && (
          <div className="mb-4 rounded-2xl p-4 text-sm font-medium text-[#e05555]"
            style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)' }}>
            {error}
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl" style={{ boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
              {capturedImage ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-1.5 backdrop-blur-sm">
                    <svg className="h-3.5 w-3.5 text-[#3ecf66]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a231b]">Ready to Scan</span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4" style={{ background: '#eaf0eb' }}>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ boxShadow: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff' }}>
                    <svg className="h-9 w-9 text-[#3ecf66] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-base font-bold text-[#1a231b]">No image yet</p>
                    <p className="mt-1 text-sm text-[#6b7e6d]">Take a photo or upload an image below</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setShowCamera(true)}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 12px #becea5, -3px -3px 8px #ffffff' }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Take Photo
              </button>
              <ImageUpload onUpload={handleImageCapture} />
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={handleSignUp}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#6b7e6d] transition-all hover:text-[#1a231b]"
                style={{ background: '#eaf0eb', boxShadow: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff' }}
              >
                <svg className="h-4 w-4 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                Sign up to save scans
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#3ecf66]/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl" style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
                <svg className="h-11 w-11 animate-pulse text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="mb-1.5 text-xl font-black text-[#1a231b]">Analyzing your food…</h2>
              <p className="text-sm text-[#6b7e6d]">Our AI is identifying ingredients</p>
            </div>
          </div>
        )}

        {step === 'questions' && initialAnalysis && (
          <div className="space-y-4 sm:space-y-6">
            {capturedImage && (
              <div className="relative mx-auto w-36 overflow-hidden rounded-2xl sm:w-48" style={{ boxShadow: '6px 6px 14px #c4ccc5, -6px -6px 14px #ffffff', border: '2px solid rgba(62,207,102,0.3)' }}>
                <div className="aspect-square">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 backdrop-blur-sm">
                  <svg className="h-3 w-3 text-[#3ecf66]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="max-w-[80px] truncate text-[8px] font-bold uppercase tracking-wider text-[#1a231b] sm:max-w-none sm:text-[10px]">Detected: {initialAnalysis.food_name}</span>
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
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#3ecf66]/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl" style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
                <svg className="h-11 w-11 animate-spin text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="mb-1.5 text-xl font-black text-[#1a231b]">Calculating nutrition…</h2>
              <p className="text-sm text-[#6b7e6d]">Building your nutrition profile</p>
            </div>
          </div>
        )}

        {step === 'results' && nutritionData && (
          <>
            {/* Sign-up upsell banner */}
            <div className="mb-6 rounded-2xl p-5 relative overflow-hidden" style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, #3ecf66, #2bb554)' }} />
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div className="flex-1">
                  <h2 className="mb-1 text-base font-black text-[#1a231b]">Want personalized insights?</h2>
                  <p className="mb-3 text-sm text-[#6b7e6d]">Sign up free to unlock allergy warnings, save meals, and track your nutrition over time.</p>
                  <button
                    onClick={handleSignUp}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 7px #becea5' }}
                  >
                    Sign Up Free
                  </button>
                </div>
              </div>
            </div>
            <NutritionResults
              data={nutritionData}
              onSave={handleSignUp}
              onReset={handleReset}
              isSaving={false}
            />
          </>
        )}
      </main>

      {/* Guest Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex max-w-2xl justify-around rounded-2xl px-2 py-2" style={{ boxShadow: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff' }}>
          <Link
            href="/"
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[#6b7e6d] transition-all hover:text-[#1a231b] active:scale-95"
            aria-label="Go to Home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </Link>
          <div
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-3 py-2"
            style={{ background: 'rgba(62,207,102,0.1)' }}
            aria-current="page"
          >
            <svg className="h-5 w-5 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#3ecf66]">Scan</span>
          </div>
          <button
            onClick={handleSignUp}
            className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[#6b7e6d] transition-all hover:text-[#1a231b] active:scale-95"
            aria-label="Sign up for free"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Sign Up</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
