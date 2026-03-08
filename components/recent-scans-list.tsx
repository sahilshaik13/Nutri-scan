'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Scan {
  id: string
  food_name: string
  image_url?: string
  created_at: string
  nutrition_data?: { calories: number }
}

interface RecentScansListProps {
  scans: Scan[]
}

export function RecentScansList({ scans }: RecentScansListProps) {
  return (
    <div>
      <h2 className="mb-4 font-semibold">Recent Scans</h2>
      <div className="space-y-2">
        {scans.slice(0, 10).map((scan) => (
          <Link
            key={scan.id}
            href={`/insights/${scan.id}`}
            className="flex gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
          >
            {scan.image_url && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={scan.image_url}
                  alt={scan.food_name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{scan.food_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(scan.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{scan.nutrition_data?.calories || 0}</p>
              <p className="text-xs text-muted-foreground">cal</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
