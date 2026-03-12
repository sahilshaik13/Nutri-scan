'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Check, X, Plus } from 'lucide-react'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:     '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:  'inset 3px 3px 8px #c4ccc5, inset -3px -3px 8px #ffffff',
  pressed:'inset 2px 2px 5px #c0c8c1, inset -2px -2px 5px #f4faf5',
}

// Step 2: Food Allergies — FDA Big 9 + Mustard (local)
const ALLERGIES = [
  { id: 'gluten', label: 'Gluten', description: 'Wheat, barley, rye' },
  { id: 'dairy', label: 'Dairy', description: 'Milk, cheese, butter' },
  { id: 'peanuts', label: 'Peanuts', description: 'Peanuts, peanut butter' },
  { id: 'tree_nuts', label: 'Tree Nuts', description: 'Almonds, walnuts, cashews' },
  { id: 'eggs', label: 'Eggs', description: 'Whole eggs, egg products' },
  { id: 'soy', label: 'Soy', description: 'Soy sauce, tofu, tempeh' },
  { id: 'shellfish', label: 'Shellfish', description: 'Shrimp, crab, lobster' },
  { id: 'fish', label: 'Fish', description: 'All types of fish' },
  { id: 'sesame', label: 'Sesame', description: 'Sesame seeds, tahini' },
  { id: 'mustard', label: 'Mustard', description: 'Mustard seeds, condiments' },
]

// Step 3: Food Intolerances & Sensitivities
const INTOLERANCES = [
  { id: 'lactose', label: 'Lactose', description: 'Milk sugar sensitivity' },
  { id: 'gluten_sensitivity', label: 'Gluten Sensitivity', description: 'Non-celiac gluten sensitivity' },
  { id: 'caffeine', label: 'Caffeine', description: 'Coffee, tea, energy drinks' },
  { id: 'alcohol', label: 'Alcohol', description: 'All alcoholic beverages' },
  { id: 'msg', label: 'MSG', description: 'Monosodium glutamate' },
  { id: 'artificial_sweeteners', label: 'Artificial Sweeteners', description: 'Aspartame, sucralose' },
  { id: 'histamine', label: 'Histamine', description: 'Aged foods, fermented' },
  { id: 'fodmap', label: 'FODMAP Sensitivity', description: 'Fermentable carbs' },
  { id: 'fructose', label: 'Fructose', description: 'Fruit sugar sensitivity' },
  { id: 'sulfites', label: 'Sulfites', description: 'Wine, dried fruits' },
  { id: 'spicy_food', label: 'Spicy Food', description: 'Chilli, pepper sensitivity' },
  { id: 'fried_food', label: 'Fried Food', description: 'Deep-fried, oily foods' },
]

// Step 4: Medical Conditions (diet-related)
const CONDITIONS = [
  { id: 'diabetes_type1', label: 'Type 1 Diabetes', description: 'Insulin-dependent' },
  { id: 'diabetes_type2', label: 'Type 2 Diabetes', description: 'Insulin-resistant' },
  { id: 'hypertension', label: 'Hypertension', description: 'High blood pressure' },
  { id: 'high_cholesterol', label: 'High Cholesterol', description: 'Elevated lipid levels' },
  { id: 'pcos', label: 'PCOS / PCOD', description: 'Polycystic ovary syndrome' },
  { id: 'thyroid_disorders', label: 'Thyroid Disorders', description: 'Hypo/hyperthyroidism' },
  { id: 'kidney_disease', label: 'Kidney Disease', description: 'Renal conditions' },
  { id: 'heart_disease', label: 'Heart Disease', description: 'Cardiovascular conditions' },
  { id: 'obesity', label: 'Obesity', description: 'Clinically overweight' },
  { id: 'gerd', label: 'Acid Reflux (GERD)', description: 'Acid reflux disease' },
  { id: 'anemia', label: 'Anemia', description: 'Iron deficiency' },
]

// Step 5: Dietary Lifestyle & Preferences
const LIFESTYLES = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'keto', label: 'Keto', description: 'Low carb, high fat' },
  { id: 'low_carb', label: 'Low Carb', description: 'Reduced carbohydrates' },
  { id: 'low_fat', label: 'Low Fat', description: 'Reduced fat intake' },
  { id: 'low_sodium', label: 'Low Sodium', description: 'Reduced salt intake' },
  { id: 'gluten_free', label: 'Gluten-Free', description: 'No gluten-containing foods' },
  { id: 'dairy_free', label: 'Dairy-Free', description: 'No dairy products' },
  { id: 'high_protein', label: 'High Protein', description: 'Protein-focused diet' },
  { id: 'mediterranean', label: 'Mediterranean Diet', description: 'Plant-based, olive oil' },
]

// Step 6: Primary Health Goals
const HEALTH_GOALS = [
  { id: 'weight_loss', label: 'Weight Loss', description: 'Reduce body weight' },
  { id: 'muscle_gain', label: 'Muscle Gain', description: 'Build lean muscle mass' },
  { id: 'heart_health', label: 'Improve Heart Health', description: 'Cardiovascular wellness' },
  { id: 'blood_sugar', label: 'Control Blood Sugar', description: 'Manage glucose levels' },
  { id: 'reduce_cholesterol', label: 'Reduce Cholesterol', description: 'Lower lipid levels' },
  { id: 'gut_health', label: 'Improve Gut Health', description: 'Digestive wellness' },
  { id: 'maintain_weight', label: 'Maintain Weight', description: 'Stay at current weight' },
  { id: 'increase_energy', label: 'Increase Energy', description: 'Boost daily energy' },
  { id: 'balanced_nutrition', label: 'Balanced Nutrition', description: 'Well-rounded diet' },
  { id: 'improve_metabolism', label: 'Improve Metabolism', description: 'Metabolic efficiency' },
]

type ListCategory = 'allergies' | 'intolerances' | 'conditions' | 'lifestyles' | 'health_goals'

interface ListStep {
  type: 'list'
  id: ListCategory
  title: string
  subtitle: string
  noneLabel: string
  data: { id: string; label: string; description: string }[]
}

interface MetricsStep {
  type: 'metrics'
  id: 'body_metrics'
  title: string
  subtitle: string
}

type Step = ListStep | MetricsStep

const STEPS: Step[] = [
  { type: 'metrics', id: 'body_metrics', title: 'Basic Body Metrics', subtitle: "We'll calculate your BMI to personalize recommendations" },
  { type: 'list', id: 'allergies', title: 'Food Allergies', subtitle: 'Select any food allergies you have (FDA & WHO aligned)', noneLabel: "I don't have any food allergies", data: ALLERGIES },
  { type: 'list', id: 'intolerances', title: 'Food Intolerances', subtitle: 'Select any food sensitivities you experience', noneLabel: "I don't have any food intolerances", data: INTOLERANCES },
  { type: 'list', id: 'conditions', title: 'Medical Conditions', subtitle: 'Select conditions that affect your diet', noneLabel: "I don't have any medical conditions", data: CONDITIONS },
  { type: 'list', id: 'lifestyles', title: 'Dietary Lifestyle', subtitle: 'Select your dietary preferences', noneLabel: 'No specific preference', data: LIFESTYLES },
  { type: 'list', id: 'health_goals', title: 'Primary Health Goals', subtitle: 'What are you looking to achieve?', noneLabel: '', data: HEALTH_GOALS },
]

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Body metrics
  const [bodyMetrics, setBodyMetrics] = useState({
    height: '', // cm
    weight: '', // kg
    age: '',
    biological_sex: '',
  })

  // Steps 2-6: List-based selections
  const [selections, setSelections] = useState<Record<ListCategory, string[]>>({
    allergies: [],
    intolerances: [],
    conditions: [],
    lifestyles: [],
    health_goals: [],
  })
  const [customInputs, setCustomInputs] = useState<Record<ListCategory, string[]>>({
    allergies: [],
    intolerances: [],
    conditions: [],
    lifestyles: [],
    health_goals: [],
  })
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [noneSelected, setNoneSelected] = useState<Record<ListCategory, boolean>>({
    allergies: false,
    intolerances: false,
    conditions: false,
    lifestyles: false,
    health_goals: false,
  })

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  // BMI calculation
  const bmi = useMemo(() => {
    const h = parseFloat(bodyMetrics.height)
    const w = parseFloat(bodyMetrics.weight)
    if (h > 0 && w > 0) {
      return w / ((h / 100) ** 2)
    }
    return null
  }, [bodyMetrics.height, bodyMetrics.weight])

  const toggleSelection = (category: ListCategory, id: string) => {
    if (noneSelected[category]) {
      setNoneSelected(prev => ({ ...prev, [category]: false }))
    }
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(item => item !== id)
        : [...prev[category], id]
    }))
  }

  const toggleNone = (category: ListCategory) => {
    const isCurrentlyNone = noneSelected[category]
    setNoneSelected(prev => ({ ...prev, [category]: !isCurrentlyNone }))
    if (!isCurrentlyNone) {
      setSelections(prev => ({ ...prev, [category]: [] }))
      setCustomInputs(prev => ({ ...prev, [category]: [] }))
    }
  }

  const addCustomItems = () => {
    if (!customValue.trim() || step.type !== 'list') return
    const category = step.id
    // Parse comma-separated values into distinct items
    const items = customValue.split(',').map(s => s.trim()).filter(Boolean)
    if (items.length === 0) return

    if (noneSelected[category]) {
      setNoneSelected(prev => ({ ...prev, [category]: false }))
    }
    setCustomInputs(prev => ({
      ...prev,
      [category]: [...prev[category], ...items]
    }))
    setCustomValue('')
    setShowCustomInput(false)
  }

  const removeCustomItem = (category: ListCategory, item: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [category]: prev[category].filter(i => i !== item)
    }))
  }

  const handleNext = () => {
    setShowCustomInput(false)
    setCustomValue('')
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setShowCustomInput(false)
    setCustomValue('')
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const height = parseFloat(bodyMetrics.height) || null
      const weight = parseFloat(bodyMetrics.weight) || null
      const age = parseInt(bodyMetrics.age, 10) || null
      const calculatedBmi = height && weight ? weight / ((height / 100) ** 2) : null

      const profileData = {
        user_id: user.id,
        height,
        weight,
        age,
        biological_sex: bodyMetrics.biological_sex || null,
        bmi: calculatedBmi ? Math.round(calculatedBmi * 10) / 10 : null,
        bmi_category: calculatedBmi ? getBmiCategory(calculatedBmi) : null,
        allergies: noneSelected.allergies ? [] : [...selections.allergies, ...customInputs.allergies],
        intolerances: noneSelected.intolerances ? [] : [...selections.intolerances, ...customInputs.intolerances],
        medical_conditions: noneSelected.conditions ? [] : [...selections.conditions, ...customInputs.conditions],
        dietary_lifestyles: noneSelected.lifestyles ? [] : [...selections.lifestyles, ...customInputs.lifestyles],
        health_goals: noneSelected.health_goals ? [] : [...selections.health_goals, ...customInputs.health_goals],
        onboarding_completed: true,
      }

      const { error } = await supabase
        .from('health_profiles')
        .upsert(profileData, { onConflict: 'user_id' })

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to save health profile:', err)
      setIsLoading(false)
    }
  }

  // Derived state for list steps
  const listCategory = step.type === 'list' ? step.id : null
  const totalSelections = listCategory ? selections[listCategory].length + customInputs[listCategory].length : 0
  const hasAnySelection = listCategory ? (totalSelections > 0 || noneSelected[listCategory]) : false

  return (
    <div className="flex min-h-screen flex-col pb-28" style={{ background: '#eaf0eb' }}>
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: '#eaf0eb' }}>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <svg className="h-8 w-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div className="mb-4 h-2 w-48 overflow-hidden rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            <div className="h-full w-full animate-[loading_1.5s_ease-in-out_infinite] rounded-full" style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)' }} />
          </div>
          <p className="text-lg font-black text-[#1a231b]">Saving your preferences...</p>
          <p className="text-sm text-[#6b7e6d]">Setting up your personalized experience</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl px-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className="text-base font-black tracking-tight text-[#1a231b]">NutriScan</span>
          </div>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#6b7e6d] transition-all hover:scale-105 hover:text-[#3ecf66] active:scale-95 disabled:opacity-50"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}
          >
            Skip for now
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        {/* Progress */}
        <div className="mb-6 rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3ecf66]">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #3ecf66, #2bb554)' }}
            />
          </div>
        </div>

        {/* Step Title */}
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h1>
          <p className="text-sm text-[#6b7e6d]">{step.subtitle}</p>
        </div>

        {/* Step 1: Body Metrics */}
        {step.type === 'metrics' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Height */}
              <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
                <label htmlFor="height" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Height (cm)</label>
                <input
                  id="height"
                  type="number"
                  placeholder="e.g. 170"
                  min={50}
                  max={300}
                  value={bodyMetrics.height}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[#1a231b] outline-none placeholder:text-[#b0bab1]"
                  style={{ background: '#eaf0eb', boxShadow: neu.pressed }}
                />
              </div>
              {/* Weight */}
              <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
                <label htmlFor="weight" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  placeholder="e.g. 70"
                  min={10}
                  max={500}
                  value={bodyMetrics.weight}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[#1a231b] outline-none placeholder:text-[#b0bab1]"
                  style={{ background: '#eaf0eb', boxShadow: neu.pressed }}
                />
              </div>
              {/* Age */}
              <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
                <label htmlFor="age" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Age</label>
                <input
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  min={1}
                  max={150}
                  value={bodyMetrics.age}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[#1a231b] outline-none placeholder:text-[#b0bab1]"
                  style={{ background: '#eaf0eb', boxShadow: neu.pressed }}
                />
              </div>
              {/* Biological Sex */}
              <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Biological Sex</p>
                <div className="flex gap-2">
                  {[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBodyMetrics(prev => ({ ...prev, biological_sex: opt.value }))}
                      className="flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      style={bodyMetrics.biological_sex === opt.value
                        ? { background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', color: '#fff', boxShadow: '3px 3px 7px #becea5' }
                        : { background: '#eaf0eb', color: '#6b7e6d', boxShadow: neu.sm }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BMI Display */}
            {bmi !== null && (
              <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Your BMI</p>
                    <p className="text-4xl font-black text-[#1a231b]">{bmi.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Category</p>
                    <p className="text-xl font-black text-[#3ecf66]">{getBmiCategory(bmi)}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max((bmi / 40) * 100, 5), 100)}%`, background: 'linear-gradient(90deg, #3ecf66, #2bb554)' }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-[#6b7e6d]">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steps 2-6: List-Based Selection */}
        {step.type === 'list' && listCategory && (
          <>
            {/* None Option */}
            {step.noneLabel && (
              <div
                className="mb-4 cursor-pointer rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: noneSelected[listCategory] ? 'linear-gradient(135deg, rgba(62,207,102,0.08), rgba(43,181,84,0.05))' : '#eaf0eb',
                  boxShadow: noneSelected[listCategory] ? 'inset 3px 3px 8px #c4ccc5, inset -3px -3px 8px #ffffff' : neu.sm,
                  border: noneSelected[listCategory] ? '1px solid rgba(62,207,102,0.3)' : '1px solid transparent',
                }}
                onClick={() => toggleNone(listCategory)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all"
                    style={noneSelected[listCategory]
                      ? { background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '2px 2px 5px #becea5' }
                      : { background: '#eaf0eb', boxShadow: neu.inset }
                    }
                  >
                    {noneSelected[listCategory] && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a231b]">None</p>
                    <p className="text-xs text-[#6b7e6d]">{step.noneLabel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Options Grid */}
            <div className={`mb-4 grid gap-3 sm:grid-cols-2 ${noneSelected[listCategory] ? 'pointer-events-none opacity-40' : ''}`}>
              {step.data.map((item) => {
                const isSelected = selections[listCategory].includes(item.id)
                return (
                  <div
                    key={item.id}
                    className="cursor-pointer rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(62,207,102,0.08), rgba(43,181,84,0.05))' : '#eaf0eb',
                      boxShadow: isSelected ? 'inset 3px 3px 8px #c4ccc5, inset -3px -3px 8px #ffffff' : neu.sm,
                      border: isSelected ? '1px solid rgba(62,207,102,0.3)' : '1px solid transparent',
                    }}
                    onClick={() => toggleSelection(listCategory, item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all"
                        style={isSelected
                          ? { background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '2px 2px 5px #becea5' }
                          : { background: '#eaf0eb', boxShadow: neu.inset }
                        }
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1a231b]">{item.label}</p>
                        <p className="text-xs text-[#6b7e6d]">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Items Display */}
            {customInputs[listCategory].length > 0 && !noneSelected[listCategory] && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Custom items</p>
                <div className="flex flex-wrap gap-2">
                  {customInputs[listCategory].map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-[#3ecf66]"
                      style={{ background: 'rgba(62,207,102,0.1)', border: '1px solid rgba(62,207,102,0.2)' }}
                    >
                      {item}
                      <button
                        onClick={() => removeCustomItem(listCategory, item)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-[rgba(62,207,102,0.2)]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Option */}
            {!noneSelected[listCategory] && (
              <div className="mb-6">
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter items (comma-separated)..."
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomItems()}
                      autoFocus
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-[#1a231b] outline-none placeholder:text-[#b0bab1]"
                      style={{ background: '#eaf0eb', boxShadow: neu.pressed }}
                    />
                    <button
                      onClick={addCustomItems}
                      disabled={!customValue.trim()}
                      className="rounded-xl px-4 py-3 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 7px #becea5' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowCustomInput(false); setCustomValue('') }}
                      className="rounded-xl px-4 py-3 text-xs font-bold text-[#6b7e6d] transition-all hover:scale-105 active:scale-95"
                      style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer rounded-2xl border border-dashed border-[#b0bab1] p-4 transition-all hover:scale-[1.01] hover:border-[#3ecf66] active:scale-[0.99]"
                    style={{ background: '#eaf0eb' }}
                    onClick={() => setShowCustomInput(true)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                        <Plus className="h-3 w-3 text-[#6b7e6d]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a231b]">Other (Specify)</p>
                        <p className="text-xs text-[#6b7e6d]">Add custom items not listed above (comma-separated)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selection Summary */}
            {hasAnySelection && !noneSelected[listCategory] && totalSelections > 0 && (
              <div className="mb-6 rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7e6d]">Selected ({totalSelections})</p>
                <div className="flex flex-wrap gap-2">
                  {selections[listCategory].map(id => {
                    const item = step.data.find(d => d.id === id)
                    return (
                      <span
                        key={id}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-[#3ecf66]"
                        style={{ background: 'rgba(62,207,102,0.1)', border: '1px solid rgba(62,207,102,0.2)' }}
                      >
                        {item?.label}
                      </span>
                    )
                  })}
                  {customInputs[listCategory].map((item, index) => (
                    <span
                      key={`custom-${index}`}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-[#3ecf66]"
                      style={{ background: 'rgba(62,207,102,0.1)', border: '1px solid rgba(62,207,102,0.2)' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-1 rounded-xl px-5 py-3 text-sm font-bold text-[#6b7e6d] transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex min-w-[120px] items-center justify-center gap-1 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '4px 4px 10px #becea5, -2px -2px 6px #ffffff' }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : isLastStep ? (
              'Complete'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
