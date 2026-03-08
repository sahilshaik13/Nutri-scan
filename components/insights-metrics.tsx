'use client'

interface InsightsMetricsProps {
  totalScans: number
  avgHealthScore: number
  avgCalories: number
  weekCalories: number
}

export function InsightsMetrics({
  totalScans,
  avgHealthScore,
  avgCalories,
  weekCalories,
}: InsightsMetricsProps) {
  return (
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
  )
}
