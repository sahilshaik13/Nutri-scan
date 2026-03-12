'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Leaf, Check, X, Plus } from 'lucide-react'

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
    <div className="min-h-screen bg-background">
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Leaf className="h-8 w-8 animate-pulse text-primary-foreground" />
          </div>
          <div className="mb-4 h-2 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full animate-[loading_1.5s_ease-in-out_infinite] bg-primary" />
          </div>
          <p className="text-lg font-medium">Saving your preferences...</p>
          <p className="text-sm text-muted-foreground">Setting up your personalized experience</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">NutriScan</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">{step.title}</h1>
          <p className="text-muted-foreground">{step.subtitle}</p>
        </div>

        {/* Step 1: Body Metrics */}
        {step.type === 'metrics' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="e.g. 170"
                  min={50}
                  max={300}
                  value={bodyMetrics.height}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g. 70"
                  min={10}
                  max={500}
                  value={bodyMetrics.weight}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  min={1}
                  max={150}
                  value={bodyMetrics.age}
                  onChange={(e) => setBodyMetrics(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Biological Sex</Label>
                <Select
                  value={bodyMetrics.biological_sex}
                  onValueChange={(value) => setBodyMetrics(prev => ({ ...prev, biological_sex: value }))}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BMI Display */}
            {bmi !== null && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Your BMI</p>
                      <p className="text-3xl font-bold">{bmi.toFixed(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="text-lg font-semibold text-primary">{getBmiCategory(bmi)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(Math.max((bmi / 40) * 100, 5), 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Steps 2-6: List-Based Selection */}
        {step.type === 'list' && listCategory && (
          <>
            {/* None Option (not shown for health_goals) */}
            {step.noneLabel && (
              <Card 
                className={`mb-4 cursor-pointer transition-all hover:border-primary/50 ${
                  noneSelected[listCategory] ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                }`}
                onClick={() => toggleNone(listCategory)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Checkbox checked={noneSelected[listCategory]} className="mt-0.5" />
                  <div className="flex-1">
                    <Label className="cursor-pointer font-medium">None</Label>
                    <p className="text-sm text-muted-foreground">{step.noneLabel}</p>
                  </div>
                  {noneSelected[listCategory] && <Check className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            )}

            {/* Options Grid */}
            <div className={`mb-4 grid gap-3 sm:grid-cols-2 ${noneSelected[listCategory] ? 'pointer-events-none opacity-50' : ''}`}>
              {step.data.map((item) => {
                const isSelected = selections[listCategory].includes(item.id)
                return (
                  <Card 
                    key={item.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                    }`}
                    onClick={() => toggleSelection(listCategory, item.id)}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <Checkbox checked={isSelected} className="mt-0.5" />
                      <div className="flex-1">
                        <Label className="cursor-pointer font-medium">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Custom Items Display */}
            {customInputs[listCategory].length > 0 && !noneSelected[listCategory] && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Custom items:</p>
                <div className="flex flex-wrap gap-2">
                  {customInputs[listCategory].map((item, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {item}
                      <button
                        onClick={() => removeCustomItem(listCategory, item)}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
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
              <div className="mb-8">
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter items (comma-separated)..."
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomItems()}
                      autoFocus
                      className="flex-1"
                    />
                    <Button onClick={addCustomItems} disabled={!customValue.trim()}>
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => { setShowCustomInput(false); setCustomValue('') }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Card 
                    className="cursor-pointer border-dashed transition-all hover:border-primary/50 hover:bg-muted/50"
                    onClick={() => setShowCustomInput(true)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-dashed border-muted-foreground/50">
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="cursor-pointer font-medium">Other (Specify)</Label>
                        <p className="text-sm text-muted-foreground">Add custom items not listed above (comma-separated)</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Selection Summary */}
            {hasAnySelection && !noneSelected[listCategory] && totalSelections > 0 && (
              <div className="mb-8 rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Selected ({totalSelections})</p>
                <div className="flex flex-wrap gap-2">
                  {selections[listCategory].map(id => {
                    const item = step.data.find(d => d.id === id)
                    return (
                      <span 
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {item?.label}
                      </span>
                    )
                  })}
                  {customInputs[listCategory].map((item, index) => (
                    <span 
                      key={`custom-${index}`}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
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
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="min-w-[120px]"
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
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
