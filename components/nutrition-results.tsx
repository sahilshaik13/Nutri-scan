'use client'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  Droplets, 
  Wheat, 
  Beef, 
  Heart,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CircleX,
  User
} from 'lucide-react'

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

interface NutritionResultsProps {
  data: NutritionData
  onSave: () => void
  onReset: () => void
  isSaving: boolean
}

// Custom theme colors for neumorphic design
const THEME = {
  bg: '#eaf0eb',
  shadowLight: '#ffffff',
  shadowDark: '#c4ccc5',
  primary: '#3ecf66',
  primaryDark: '#2bb554',
  textMain: '#1a231b',
  textMuted: '#6b7e6d',
  danger: '#ff4b4b',
  warning: '#ffb020',
  caution: '#f5d90a',
  safe: '#3ecf66'
}

function getHealthGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)' // Excellent
  if (score >= 60) return 'linear-gradient(135deg, #84dcc6 0%, #3ecf66 100%)' // Good
  if (score >= 40) return 'linear-gradient(135deg, #f5d90a 0%, #d4b800 100%)' // Moderate
  return 'linear-gradient(135deg, #ff4b4b 0%, #d63d3d 100%)' // Poor
}

function getProgressColorClass(score: number): string {
  if (score >= 80) return 'bg-[#3ecf66]'
  if (score >= 60) return 'bg-[#84dcc6]'
  if (score >= 40) return 'bg-[#f5d90a]'
  return 'bg-[#ff4b4b]'
}

function getImpactIcon(level: string) {
  switch (level) {
    case 'safe':
      return <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: THEME.safe }} />
    case 'caution':
      return <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: THEME.caution }} />
    case 'warning':
      return <ShieldAlert className="h-5 w-5 shrink-0" style={{ color: THEME.warning }} />
    case 'danger':
      return <CircleX className="h-5 w-5 shrink-0" style={{ color: THEME.danger }} />
    default:
      return <AlertCircle className="h-5 w-5 shrink-0" style={{ color: THEME.textMuted }} />
  }
}

function getImpactBadgeStyle(level: string) {
  switch (level) {
    case 'safe':
      return { bg: 'rgba(62, 207, 102, 0.1)', color: THEME.safe, border: `1px solid rgba(62, 207, 102, 0.3)` }
    case 'caution':
      return { bg: 'rgba(245, 217, 10, 0.1)', color: '#b39c00', border: `1px solid rgba(245, 217, 10, 0.3)` }
    case 'warning':
      return { bg: 'rgba(255, 176, 32, 0.1)', color: '#cc8d1a', border: `1px solid rgba(255, 176, 32, 0.3)` }
    case 'danger':
      return { bg: 'rgba(255, 75, 75, 0.1)', color: THEME.danger, border: `1px solid rgba(255, 75, 75, 0.3)` }
    default:
      return { bg: 'rgba(107, 126, 109, 0.1)', color: THEME.textMuted, border: `1px solid rgba(107, 126, 109, 0.3)` }
  }
}

// Maps impact level to a risk score (1 = safest, 10 = most risky)
function getImpactScore(level: string): number {
  switch (level) {
    case 'safe':    return 2
    case 'caution': return 4
    case 'warning': return 7
    case 'danger':  return 9
    default:        return 5
  }
}

// Returns a short summary label for the scale
function getScoreLabel(score: number): string {
  if (score <= 3) return 'Low Risk'
  if (score <= 5) return 'Moderate'
  if (score <= 7) return 'High Risk'
  return 'Avoid'
}

function ImpactScaleRow({ impact }: { impact: PersonalHealthImpact }) {
  const score = getImpactScore(impact.impact_level)
  const percent = ((score - 1) / 9) * 100 // position along the bar

  // derive a short 1-liner: first sentence only, capped at 80 chars
  const oneLiner = (() => {
    const first = impact.explanation.split(/\.\s/)[0].replace(/\.$/, '')
    return first.length > 90 ? first.slice(0, 87) + '…' : first
  })()

  return (
    <div className="flex flex-col gap-2 py-3 border-b last:border-b-0" style={{ borderColor: 'rgba(196, 204, 197, 0.35)' }}>
      {/* Top row: icon + condition + score label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {getImpactIcon(impact.impact_level)}
          <span className="font-bold text-sm text-[#1a231b] truncate">{impact.condition}</span>
        </div>
        <span
          className="text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: getImpactBadgeStyle(impact.impact_level).bg,
            color: getImpactBadgeStyle(impact.impact_level).color,
            border: getImpactBadgeStyle(impact.impact_level).border,
          }}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      {/* 1-liner */}
      <p className="text-xs leading-relaxed" style={{ color: THEME.textMuted }}>{oneLiner}.</p>

      {/* Scale bar */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold shrink-0" style={{ color: THEME.textMuted }}>1</span>
        <div className="relative flex-1 h-2 rounded-full overflow-visible" style={{ background: 'rgba(0,0,0,0.07)' }}>
          {/* Gradient track */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(to right, #3ecf66, #f5d90a 40%, #ffb020 65%, #ff4b4b)' }}
          />
          {/* Pointer dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-500"
            style={{
              left: `calc(${percent}% - 8px)`,
              background: percent > 65 ? '#ff4b4b' : percent > 40 ? '#ffb020' : '#3ecf66',
              boxShadow: '0 1px 6px rgba(0,0,0,0.25)'
            }}
          />
        </div>
        <span className="text-[10px] font-bold shrink-0" style={{ color: THEME.textMuted }}>10</span>
        <span className="text-xs font-black shrink-0 w-8 text-right" style={{ color: THEME.textMain }}>{score}/10</span>
      </div>
    </div>
  )
}

// Daily values for reference
const dailyValues = {
  calories: 2000,
  total_fat: 78,
  saturated_fat: 20,
  cholesterol: 300,
  sodium: 2300,
  total_carbohydrates: 275,
  dietary_fiber: 28,
  total_sugars: 50,
  protein: 50,
  vitamin_d: 20,
  calcium: 1300,
  iron: 18,
  potassium: 4700,
}

// Custom wrapper for the neumorphic embossed look
const NeumorphicCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={`rounded-3xl p-5 sm:p-6 ${className}`}
    style={{ 
      background: THEME.bg,
      boxShadow: `8px 8px 20px ${THEME.shadowDark}, -8px -8px 20px ${THEME.shadowLight}`
    }}
  >
    {children}
  </div>
)

// Custom deeply inset card
const InsetCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={`rounded-2xl p-4 ${className}`}
    style={{ 
      background: THEME.bg,
      boxShadow: `inset 4px 4px 10px ${THEME.shadowDark}, inset -4px -4px 10px ${THEME.shadowLight}`
    }}
  >
    {children}
  </div>
)

export function NutritionResults({ data, onSave, onReset, isSaving }: NutritionResultsProps) {
  const dvPercent = (value: number, dv: number) => Math.round((value / dv) * 100)
  
  const hasPersonalImpacts = data.personal_health_impacts && data.personal_health_impacts.length > 0
  const dangerImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'danger') || []
  const warningImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'warning') || []
  const cautionImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'caution') || []
  const safeImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'safe') || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tip Banner */}
      <div 
        className="rounded-2xl p-4 text-sm font-medium flex items-start gap-3 relative overflow-hidden"
        style={{ background: 'rgba(62, 207, 102, 0.1)', border: '1px solid rgba(62, 207, 102, 0.2)' }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#3ecf66]" />
        <span className="text-xl">💡</span>
        <p className="text-[#1a231b] pt-0.5 leading-relaxed truncate whitespace-normal">
          <strong className="text-[#2bb554]">Tip:</strong> Save this scan to access detailed insights and personalized recommendations later.
        </p>
      </div>

      {/* Main Score Card */}
      <NeumorphicCard className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-[#1a231b] break-words leading-tight">{data.food_name}</h3>
            <p className="text-sm font-medium mt-1 truncate" style={{ color: THEME.textMuted }}>{data.serving_size}</p>
          </div>
          
          <div 
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-3xl text-white shadow-inner sm:self-center self-start"
            style={{ 
              background: getHealthGradient(data.health_score),
              boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-3xl font-black">{data.health_score}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Score</span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2 font-bold">
            <span style={{ color: THEME.textMuted }}>Overall Health Rating</span>
            <span 
              className="px-3 py-1 rounded-full text-xs uppercase tracking-wider whitespace-nowrap"
              style={{ background: 'rgba(0,0,0,0.05)', color: THEME.textMain }}
            >
              {data.health_rating}
            </span>
          </div>
          <Progress 
            value={data.health_score} 
            className="h-3 bg-black/5" 
            indicatorClassName={getProgressColorClass(data.health_score)}
          />
        </div>
      </NeumorphicCard>

      {/* Personal Health Impacts */}
      {hasPersonalImpacts && (
        <NeumorphicCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(62, 207, 102, 0.1)', color: THEME.primary }}>
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1a231b]">How This Affects You</h3>
              <p className="text-xs font-medium" style={{ color: THEME.textMuted }}>Based on your health profile</p>
            </div>
          </div>
          
          <div className="divide-y-0">
            {[
              ...dangerImpacts,
              ...warningImpacts,
              ...cautionImpacts,
              ...safeImpacts,
            ].map((impact, i) => (
              <ImpactScaleRow key={`${impact.impact_level}-${i}`} impact={impact} />
            ))}
          </div>
        </NeumorphicCard>
      )}

      {/* Main Macros Grid */}
      <NeumorphicCard>
        <h3 className="text-base font-black text-[#1a231b] mb-4">Nutrition Facts</h3>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <InsetCard className="flex flex-col items-center justify-center text-center p-3">
            <Flame className="mb-2 h-6 w-6 shrink-0" style={{ color: THEME.warning }} />
            <span className="text-2xl font-black text-[#1a231b] truncate max-w-full">{data.calories}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 truncate max-w-full" style={{ color: THEME.textMuted }}>Calories</span>
          </InsetCard>
          
          <InsetCard className="flex flex-col items-center justify-center text-center p-3">
            <Droplets className="mb-2 h-6 w-6 shrink-0" style={{ color: '#84dcc6' }} />
            <span className="text-2xl font-black text-[#1a231b] truncate max-w-full">{data.total_fat}g</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 truncate max-w-full" style={{ color: THEME.textMuted }}>Fat</span>
          </InsetCard>
          
          <InsetCard className="flex flex-col items-center justify-center text-center p-3">
            <Wheat className="mb-2 h-6 w-6 shrink-0" style={{ color: '#d4b800' }} />
            <span className="text-2xl font-black text-[#1a231b] truncate max-w-full">{data.total_carbohydrates}g</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 truncate max-w-full" style={{ color: THEME.textMuted }}>Carbs</span>
          </InsetCard>
          
          <InsetCard className="flex flex-col items-center justify-center text-center p-3">
            <Beef className="mb-2 h-6 w-6 shrink-0" style={{ color: THEME.danger }} />
            <span className="text-2xl font-black text-[#1a231b] truncate max-w-full">{data.protein}g</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 truncate max-w-full" style={{ color: THEME.textMuted }}>Protein</span>
          </InsetCard>
        </div>

        {/* Detailed Nutrition List */}
        <div className="space-y-0 text-sm w-full font-medium" style={{ color: THEME.textMain }}>
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: THEME.shadowDark }}>
            <span className="font-bold flex-1 break-words">Total Fat</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.total_fat}g <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.total_fat, dailyValues.total_fat)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2 pl-4" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Saturated Fat</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.saturated_fat}g <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.saturated_fat, dailyValues.saturated_fat)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2 pl-4" style={{ borderColor: THEME.shadowDark }}>
            <span className="opacity-80 flex-1 break-words">Trans Fat</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.trans_fat}g</span>
          </div>
          
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: THEME.shadowDark }}>
            <span className="font-bold flex-1 break-words">Cholesterol</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.cholesterol}mg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.cholesterol, dailyValues.cholesterol)}% DV)</span></span>
          </div>
          
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: THEME.shadowDark }}>
            <span className="font-bold flex-1 break-words">Sodium</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.sodium}mg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.sodium, dailyValues.sodium)}% DV)</span></span>
          </div>
          
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: THEME.shadowDark }}>
            <span className="font-bold flex-1 break-words">Total Carbohydrates</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.total_carbohydrates}g <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.total_carbohydrates, dailyValues.total_carbohydrates)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2 pl-4" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Dietary Fiber</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.dietary_fiber}g <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.dietary_fiber, dailyValues.dietary_fiber)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2 pl-4" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Total Sugars</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.total_sugars}g</span>
          </div>
          <div className="flex justify-between items-end border-b py-2 pl-8" style={{ borderColor: THEME.shadowDark }}>
            <span className="opacity-70 text-xs mt-1 flex-1 break-words">Includes Added Sugars</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.added_sugars}g</span>
          </div>
          
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: THEME.shadowDark, borderBottomWidth: '2px' }}>
            <span className="font-bold flex-1 break-words">Protein</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.protein}g <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.protein, dailyValues.protein)}% DV)</span></span>
          </div>

          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Vitamin D</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.vitamin_d}mcg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.vitamin_d, dailyValues.vitamin_d)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Calcium</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.calcium}mg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.calcium, dailyValues.calcium)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end border-b py-2" style={{ borderColor: 'rgba(196, 204, 197, 0.4)' }}>
            <span className="opacity-80 flex-1 break-words">Iron</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.iron}mg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.iron, dailyValues.iron)}% DV)</span></span>
          </div>
          <div className="flex justify-between items-end py-2">
            <span className="opacity-80 flex-1 break-words">Potassium</span>
            <span className="text-right shrink-0 whitespace-nowrap ml-2">{data.potassium}mg <span className="text-xs opacity-60 ml-1 font-normal">({dvPercent(data.potassium, dailyValues.potassium)}% DV)</span></span>
          </div>
        </div>
      </NeumorphicCard>

      {/* Identified Ingredients */}
      <NeumorphicCard>
        <h3 className="text-base font-black text-[#1a231b] mb-4">Identified Ingredients</h3>
        <div className="flex flex-wrap gap-2.5">
          {data.ingredients.map((ingredient, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 rounded-xl text-sm font-semibold truncate max-w-full"
              style={{ 
                background: THEME.bg,
                boxShadow: `inset 2px 2px 5px ${THEME.shadowDark}, inset -2px -2px 5px ${THEME.shadowLight}`,
                color: THEME.textMain
              }}
            >
              {ingredient}
            </span>
          ))}
        </div>
      </NeumorphicCard>

      {/* Health Insights */}
      <NeumorphicCard>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-5 w-5 shrink-0" style={{ color: THEME.danger }} />
          <h3 className="text-base font-black text-[#1a231b] break-words">Health Insights</h3>
        </div>
        <div className="space-y-3">
          {data.health_insights.map((insight, i) => (
            <div key={i} className="flex gap-3 text-sm font-medium leading-relaxed">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: THEME.primary }} />
              <span className="text-[#1a231b] truncate whitespace-normal">{insight}</span>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Recommendations */}
      <NeumorphicCard>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 shrink-0" style={{ color: THEME.warning }} />
          <h3 className="text-base font-black text-[#1a231b] break-words">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-2 text-sm font-medium leading-relaxed">
              <span className="font-bold shrink-0 mt-0.5" style={{ color: THEME.warning }}>•</span>
              <span className="text-[#1a231b] truncate whitespace-normal">{rec}</span>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{ 
            background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', 
            boxShadow: `4px 4px 12px rgba(43, 181, 84, 0.4), -4px -4px 12px ${THEME.shadowLight}` 
          }}
        >
          <Save className="h-5 w-5 shrink-0" />
          <span className="truncate whitespace-normal">{isSaving ? 'Saving...' : 'Save to History'}</span>
        </button>
        
        <button 
          onClick={onReset} 
          className="flex h-14 px-6 items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 sm:w-auto w-full"
          style={{ 
            background: THEME.bg, 
            color: THEME.textMain,
            boxShadow: `4px 4px 12px ${THEME.shadowDark}, -4px -4px 12px ${THEME.shadowLight}` 
          }}
        >
          <RotateCcw className="h-5 w-5 opacity-80 shrink-0" />
          <span className="truncate whitespace-normal">Scan Another</span>
        </button>
      </div>
    </div>
  )
}
