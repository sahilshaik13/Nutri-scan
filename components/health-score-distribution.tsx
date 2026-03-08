'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface HealthScoreItem {
  name: string
  value: number
  color: string
}

interface HealthScoreDistributionProps {
  data: HealthScoreItem[]
}

export function HealthScoreDistribution({ data }: HealthScoreDistributionProps) {
  if (data.length === 0) return null

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-semibold">Health Score Distribution</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col justify-center gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.value} scans</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
