'use client'

import * as React from 'react'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ─── Shared Types (Same as DashboardContent) ───────────── */
interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

export interface FoodScan {
  id: string
  food_name: string
  image_url: string | null
  ingredients: string[]
  nutrition_data: {
    serving_size?: string
    calories: number
    total_fat: number
    saturated_fat?: number
    trans_fat?: number
    cholesterol?: number
    sodium?: number
    total_carbohydrates: number
    dietary_fiber?: number
    total_sugars?: number
    added_sugars?: number
    protein: number
    vitamin_d?: number
    calcium?: number
    iron?: number
    potassium?: number
    health_insights?: string[]
    recommendations?: string[]
    personal_health_impacts?: PersonalHealthImpact[]
  }
  health_score: number
  health_rating: string
  created_at: string
}

/* ─── Shared Helpers ────────────────────────────────────── */
function getHealthColor(score: number): string {
  if (score >= 80) return '#3ecf66'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#ec4899'
  return '#ef4444'
}

function getHealthBadgeVariant(rating: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (rating?.toLowerCase()) {
    case 'excellent': case 'good': case 'very_healthy': case 'healthy': return 'default'
    case 'moderate': return 'secondary'
    case 'poor': case 'very poor': case 'unhealthy': case 'very_unhealthy': return 'destructive'
    default: return 'outline'
  }
}

function getImpactColor(level: string) {
  switch (level) {
    case 'safe':    return { bg: 'rgba(62,207,102,0.08)',  border: 'rgba(62,207,102,0.25)',  text: '#2bb554', icon: '#2bb554' }
    case 'caution': return { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  text: '#d97706', icon: '#d97706' }
    case 'warning': return { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.25)',  text: '#db2777', icon: '#db2777' }
    case 'danger':  return { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   text: '#dc2626', icon: '#dc2626' }
    default:        return { bg: '#f4f7f4', border: '#d5dfd6', text: '#1a231b', icon: '#6b7e6d' }
  }
}

function getImpactIcon(level: string) {
  const icons: Record<string, React.ReactNode> = {
    safe: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    caution: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    danger: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
  }
  return icons[level] ?? null
}

function formatRating(rating: string) {
  if (!rating) return ''
  return rating.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getImpactScore(level: string): number {
  switch (level) {
    case 'safe':    return 2
    case 'caution': return 4
    case 'warning': return 7
    case 'danger':  return 9
    default:        return 5
  }
}

function getScoreLabel(score: number): string {
  if (score <= 3) return 'Low Risk'
  if (score <= 5) return 'Moderate'
  if (score <= 7) return 'High Risk'
  return 'Avoid'
}

const neu = {
  raised:  '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:      '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:   'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
  pressed: 'inset 3px 3px 7px #c0c8c1, inset -3px -3px 7px #f4faf5',
}

interface ScanDetailsDialogProps {
  scan: FoodScan | null
  onClose: () => void
  onDelete?: (id: string) => void
}

export function ScanDetailsDialog({ scan, onClose, onDelete }: ScanDetailsDialogProps) {
  return (
    <Dialog open={!!scan} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-0 sm:max-w-lg overflow-x-hidden pr-2 [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#eaf0eb] [&::-webkit-scrollbar-track]:shadow-[inset_2px_2px_4px_#c4ccc5,inset_-2px_-2px_4px_#ffffff] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d5dfd6] [&::-webkit-scrollbar-thumb]:shadow-[2px_2px_4px_#c4ccc5,-2px_-2px_4px_#ffffff] hover:[&::-webkit-scrollbar-thumb]:bg-[#c4ccc5]"
        style={{ background: '#eaf0eb', boxShadow: '20px 20px 50px #bec7bf, -20px -20px 50px #d5dfd6', borderRadius: '1.5rem' }}
      >
        {scan && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {scan.food_name}
              </DialogTitle>
            </DialogHeader>

            {scan.image_url && (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl" style={{ boxShadow: neu.inset }}>
                <Image src={scan.image_url} alt={scan.food_name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#eaf0eb]/40 to-transparent" />
                <div
                  className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: 'rgba(234,240,235,0.9)', backdropFilter: 'blur(8px)', boxShadow: '2px 2px 5px #c4ccc5' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3ecf66] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf66]">AI Verified</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Score row */}
              <div className="flex items-center justify-between">
                <Badge variant={getHealthBadgeVariant(scan.health_rating)}>
                  {formatRating(scan.health_rating)}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#d5dfd6" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none"
                        stroke={getHealthColor(scan.health_score)}
                        strokeWidth="4"
                        strokeDasharray={`${(scan.health_score / 100) * 125.7} 125.7`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-xs font-black text-[#1a231b]">{scan.health_score}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#6b7e6d]">/100</span>
                </div>
              </div>

              {/* Macro bars */}
              <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                {[
                  { label: 'Calories', val: `${scan.nutrition_data?.calories || 0} kcal`, pct: null },
                  { label: 'Protein',  val: `${scan.nutrition_data?.protein || 0}g`,     pct: Math.min(100, ((scan.nutrition_data?.protein || 0) / 50) * 100),  color: '#3ecf66' },
                  { label: 'Carbs',    val: `${scan.nutrition_data?.total_carbohydrates || 0}g`, pct: Math.min(100, ((scan.nutrition_data?.total_carbohydrates || 0) / 80) * 100), color: '#f59e0b' },
                  { label: 'Fat',      val: `${scan.nutrition_data?.total_fat || 0}g`,  pct: Math.min(100, ((scan.nutrition_data?.total_fat || 0) / 40) * 100),  color: '#3b82f6' },
                ].map(m => (
                  <div key={m.label} className="mb-3 last:mb-0">
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span className="text-[#6b7e6d]">{m.label}</span>
                      <span className="text-[#1a231b]">{m.val}</span>
                    </div>
                    {m.pct !== null && (
                      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#eaf0eb', boxShadow: neu.pressed }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.pct}%`, background: m.color, opacity: 0.85 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Full Nutrition Table */}
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: neu.sm }}>
                <div className="px-4 py-3" style={{ background: '#eaf0eb', borderBottom: '1px solid #d5dfd6' }}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#3ecf66]">Nutrition Facts</h4>
                  {scan.nutrition_data?.serving_size && (
                    <p className="text-xs text-[#6b7e6d]">Serving: {scan.nutrition_data.serving_size}</p>
                  )}
                </div>
                <div className="divide-y divide-[#d5dfd6]" style={{ background: '#eaf0eb' }}>
                  {[
                    { label: 'Total Fat',   val: `${scan.nutrition_data?.total_fat || 0}g`,           bold: true },
                    scan.nutrition_data?.saturated_fat !== undefined && { label: 'Saturated Fat', val: `${scan.nutrition_data.saturated_fat}g`, indent: true },
                    scan.nutrition_data?.trans_fat !== undefined && { label: 'Trans Fat', val: `${scan.nutrition_data.trans_fat}g`, indent: true },
                    scan.nutrition_data?.cholesterol !== undefined && { label: 'Cholesterol', val: `${scan.nutrition_data.cholesterol}mg` },
                    scan.nutrition_data?.sodium !== undefined && { label: 'Sodium', val: `${scan.nutrition_data.sodium}mg` },
                    { label: 'Total Carbs', val: `${scan.nutrition_data?.total_carbohydrates || 0}g`,  bold: true },
                    scan.nutrition_data?.dietary_fiber !== undefined && { label: 'Dietary Fiber', val: `${scan.nutrition_data.dietary_fiber}g`, indent: true },
                    scan.nutrition_data?.total_sugars !== undefined && { label: 'Total Sugars', val: `${scan.nutrition_data.total_sugars}g`, indent: true },
                    { label: 'Protein',     val: `${scan.nutrition_data?.protein || 0}g`,             bold: true },
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2 ${row.indent ? 'pl-8' : ''}`}>
                      <span className={`text-sm ${row.bold ? 'font-bold text-[#1a231b]' : 'text-[#6b7e6d]'}`}>{row.label}</span>
                      <span className={`text-sm ${row.bold ? 'font-bold text-[#1a231b]' : 'text-[#6b7e6d]'}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Health Impacts */}
              {scan.nutrition_data?.personal_health_impacts &&
               scan.nutrition_data.personal_health_impacts.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#3ecf66]">How This Affects You</h4>
                  <div className="rounded-2xl px-4 py-1" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                    {scan.nutrition_data.personal_health_impacts
                      .sort((a, b) => ({ danger: 0, warning: 1, caution: 2, safe: 3 }[a.impact_level] ?? 4) - ({ danger: 0, warning: 1, caution: 2, safe: 3 }[b.impact_level] ?? 4))
                      .map((impact, i) => {
                        const score = getImpactScore(impact.impact_level)
                        const percent = ((score - 1) / 9) * 100
                        const c = getImpactColor(impact.impact_level)
                        const oneLiner = (() => {
                          const first = impact.explanation.split(/\.\s/)[0].replace(/\.$/, '')
                          return first.length > 90 ? first.slice(0, 87) + '…' : first
                        })()
                        return (
                          <div key={i} className="flex flex-col gap-2 py-3 border-b last:border-b-0" style={{ borderColor: 'rgba(196,204,197,0.35)' }}>
                            {/* Top row */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span style={{ color: c.icon }}>{getImpactIcon(impact.impact_level)}</span>
                                <span className="text-sm font-bold text-[#1a231b] truncate">{impact.condition}</span>
                              </div>
                              <span
                                className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                              >
                                {getScoreLabel(score)}
                              </span>
                            </div>
                            {/* 1-liner */}
                            <p className="text-xs leading-relaxed text-[#6b7e6d]">{oneLiner}.</p>
                            {/* Scale bar */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#6b7e6d] shrink-0">1</span>
                              <div className="relative flex-1 h-2 rounded-full overflow-visible" style={{ background: 'rgba(0,0,0,0.07)' }}>
                                <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #3ecf66, #f5d90a 40%, #ffb020 65%, #ff4b4b)' }} />
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white"
                                  style={{
                                    left: `calc(${percent}% - 7px)`,
                                    background: percent > 65 ? '#ff4b4b' : percent > 40 ? '#ffb020' : '#3ecf66',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#6b7e6d] shrink-0">10</span>
                              <span className="text-xs font-black text-[#1a231b] shrink-0 w-8 text-right">{score}/10</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {scan.ingredients && scan.ingredients.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-[#3ecf66]">Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {scan.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#6b7e6d]"
                        style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Insights */}
              {scan.nutrition_data?.health_insights && scan.nutrition_data.health_insights.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-[#3ecf66]">Health Insights</h4>
                  <ul className="space-y-2 text-sm text-[#6b7e6d]">
                    {scan.nutrition_data.health_insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#3ecf66]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {onDelete && (
                  <button
                    onClick={() => onDelete(scan.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#ef4444] transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: '#eaf0eb', boxShadow: neu.sm }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', boxShadow: '3px 3px 8px #becea5, -2px -2px 6px #ffffff' }}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
