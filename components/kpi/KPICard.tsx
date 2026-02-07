'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatNumber, formatPercentage, getChangeColor } from '@/lib/format'
import { cn } from '@/lib/utils'

type ValueFormat = 'number' | 'percent'

interface KPICardProps {
  label: string
  value: number
  delta?: number
  sparklineData?: number[]
  valueFormat?: ValueFormat
  className?: string
}

export function KPICard({
  label,
  value,
  delta,
  sparklineData = [],
  valueFormat = 'number',
  className,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Count-up animation on mount
  useEffect(() => {
    const duration = 800
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, value)
      setDisplayValue(current)

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const formattedValue =
    valueFormat === 'percent' ? formatPercentage(displayValue) : formatNumber(displayValue)

  const showSparkline = sparklineData.length > 0
  const maxSpark = Math.max(...sparklineData)
  const minSpark = Math.min(...sparklineData)
  const sparkRange = maxSpark - minSpark || 1

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        <div className="text-3xl font-bold tabular-nums">{formattedValue}</div>

        {delta !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', getChangeColor(delta))}>
            {delta > 0 ? (
              <ArrowUp className="h-4 w-4" />
            ) : delta < 0 ? (
              <ArrowDown className="h-4 w-4" />
            ) : null}
            <span>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}%
            </span>
          </div>
        )}

        {showSparkline && (
          <div className="h-8 flex items-end gap-px" aria-hidden="true">
            {sparklineData.map((val, idx) => {
              const height = ((val - minSpark) / sparkRange) * 100
              return (
                <div
                  key={idx}
                  className="flex-1 bg-primary/30 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
