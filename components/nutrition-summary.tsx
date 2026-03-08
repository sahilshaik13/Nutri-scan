'use client'

interface NutritionSummaryProps {
  avgCalories: number
  avgProtein: number
  totalScans: number
  avgHealthScore: number
}

export function NutritionSummary({
  avgCalories,
  avgProtein,
  totalScans,
  avgHealthScore,
}: NutritionSummaryProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-semibold">Nutrition Summary (Average)</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Calories', value: avgCalories, unit: 'kcal' },
          { label: 'Protein', value: avgProtein, unit: 'g' },
          { label: 'Scans', value: totalScans, unit: '' },
          { label: 'Health Score', value: avgHealthScore, unit: '/100' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            {item.unit && <p className="text-xs text-muted-foreground">{item.unit}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
