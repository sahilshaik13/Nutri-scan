'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { CameraCapture } from '@/components/camera-capture'
import { ImageUpload } from '@/components/image-upload'
import { AnalysisQuestions } from '@/components/analysis-questions'
import { NutritionResults } from '@/components/nutrition-results'
import Link from 'next/link'
import Image from 'next/image'

interface HealthProfile {
  allergies: string[]
  intolerances: string[]
  medical_conditions: string[]
  dietary_lifestyles: string[]
  health_goals: string[]
  height?: number | null
  weight?: number | null
  age?: number | null
  biological_sex?: string | null
  bmi?: number | null
  bmi_category?: string | null
}

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

export default function ScanPage() {
  const router = useRouter()
  // In development: http://localhost:3000 (same as frontend)
  // In production: https://your-domain.com (same as frontend)
  // API routes are served by the same frontend service
  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''
  
  const [step, setStep] = useState<ScanStep>('capture')
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('image/jpeg')
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)

  useEffect(() => {
    const fetchHealthProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('health_profiles')
          .select('allergies, intolerances, medical_conditions, dietary_lifestyles, health_goals, height, weight, age, biological_sex, bmi, bmi_category')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setHealthProfile(data)
        }
      }
    }
    
    fetchHealthProfile()
  }, [])

  const handleImageCapture = async (imageData: string, type: string) => {
    setCapturedImage(imageData)
    setMimeType(type)
    setShowCamera(false)
    setError(null)
    setStep('analyzing')

    console.log('[v0] Starting image analysis...')
    console.log('[v0] Image data length:', imageData.length)
    console.log('[v0] MIME type:', type)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageData, 
          mime_type: type,
          health_profile: healthProfile 
        }),
      })

      console.log('[v0] Response status:', response.status)
      
      const responseText = await response.text()
      console.log('[v0] Response body:', responseText.substring(0, 500))

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const data: InitialAnalysis = JSON.parse(responseText)
      console.log('[v0] Parsed data:', data)
      
      // Force allow_specify for all questions so the UI renders the custom input
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
      console.error('[v0] Error in handleImageCapture:', err)
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
          health_profile: healthProfile 
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
    
    // We removed the strict validation here because the AnalysisQuestions 
    // component now handles the flow, ensuring the user only submits when 
    // they have either answered or explicitly skipped the required questions.

    setError(null)
    setStep('calculating')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate-nutrition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: initialAnalysis.food_name,
          initial_ingredients: initialAnalysis.ingredients,
          answers, // This now seamlessly passes standard answers, custom values, and "Skipped" strings
          health_profile: healthProfile,
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
      setStep('questions')
    }
  }

  const handleSave = async () => {
    if (!nutritionData) return
    
    setIsSaving(true)
    console.log('[v0] Starting save...')
    
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('[v0] User:', user?.id, 'Error:', userError)
      
      if (!user) {
        console.log('[v0] No user, redirecting to login')
        router.push('/auth/login')
        return
      }

      const healthRatingMap: Record<string, string> = {
        'excellent': 'very_healthy',
        'good': 'healthy',
        'moderate': 'moderate',
        'poor': 'unhealthy',
        'very poor': 'very_unhealthy',
      }
      const dbHealthRating = healthRatingMap[nutritionData.health_rating.toLowerCase()] || 'moderate'

      const insertData = {
        user_id: user.id,
        food_name: nutritionData.food_name,
        image_url: capturedImage ? `data:${mimeType};base64,${capturedImage}` : null,
        ingredients: nutritionData.ingredients,
        nutrition_data: {
          serving_size: nutritionData.serving_size,
          calories: nutritionData.calories,
          total_fat: nutritionData.total_fat,
          saturated_fat: nutritionData.saturated_fat,
          trans_fat: nutritionData.trans_fat,
          cholesterol: nutritionData.cholesterol,
          sodium: nutritionData.sodium,
          total_carbohydrates: nutritionData.total_carbohydrates,
          dietary_fiber: nutritionData.dietary_fiber,
          total_sugars: nutritionData.total_sugars,
          added_sugars: nutritionData.added_sugars,
          protein: nutritionData.protein,
          vitamin_d: nutritionData.vitamin_d,
          calcium: nutritionData.calcium,
          iron: nutritionData.iron,
          potassium: nutritionData.potassium,
          health_insights: nutritionData.health_insights,
          recommendations: nutritionData.recommendations,
          personal_health_impacts: nutritionData.personal_health_impacts,
        },
        health_score: nutritionData.health_score,
        health_rating: dbHealthRating,
      }

      console.log('[v0] Insert data:', JSON.stringify(insertData).substring(0, 500))

      const { error: insertError, data: insertedData } = await supabase.from('food_scans').insert(insertData).select()

      if (insertError) {
        console.error('[v0] Insert error:', insertError)
        throw insertError
      }
      
      console.log('[v0] Save successful, redirecting to insights')
      const scanId = insertedData?.[0]?.id
      router.push(scanId ? `/insights/${scanId}` : '/dashboard')
    } catch (err) {
      console.error('[v0] Save error:', err)
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setInitialAnalysis(null)
    setNutritionData(null)
    setError(null)
    setStep('capture')
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
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#6b7e6d] transition-all hover:text-[#1a231b]"
                style={{ background: '#eaf0eb', boxShadow: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff' }}
              >
                <svg className="h-4 w-4 text-[#3ecf66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                View Recent Scans
              </Link>
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
          <NutritionResults
            data={nutritionData}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  )
}
