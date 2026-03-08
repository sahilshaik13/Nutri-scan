'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeeklyCalorieChartProps {
  data: { day: string; calories: number }[]
}

export function WeeklyCalorieChart({ data }: WeeklyCalorieChartProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-semibold">Weekly Calorie Consumption</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px'
            }}
            formatter={(value: any) => [`${value} kcal`, 'Calories']}
          />
          <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
