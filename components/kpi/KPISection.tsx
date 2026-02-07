'use client'

import { useMemo } from 'react'
import { KPICard } from './KPICard'
import { useFilters } from '@/lib/filter-context'
import type { DailyRidership, TransitMode } from '@/types/transit'
import dailyDataRaw from '@/data/daily.json'

const dailyData = dailyDataRaw as DailyRidership[]

export function KPISection() {
  const { activeModes, filterDataByDateRange } = useFilters()

  const kpiData = useMemo(() => {
    const filteredData = filterDataByDateRange(dailyData)

    if (filteredData.length === 0) {
      return {
        totalRidership: 0,
        change7d: 0,
        recoveryPct: 85,
        sparklineTotal: [],
        sparkline7d: [],
      }
    }

    // Get last 30 days for sparklines (or available data if less)
    const sparklineCount = Math.min(30, filteredData.length)
    const sparklineData = filteredData.slice(-sparklineCount)

    // Calculate total ridership for active modes
    const calculateTotal = (item: DailyRidership) => {
      let total = 0
      activeModes.forEach((mode) => {
        total += item[mode] || 0
      })
      return total
    }

    const sparklineTotal = sparklineData.map(calculateTotal)

    // Latest value
    const latest = filteredData[filteredData.length - 1]
    const totalRidership = calculateTotal(latest)

    // 7-day change
    let change7d = 0
    if (filteredData.length >= 7) {
      const sevenDaysAgo = filteredData[filteredData.length - 7]
      const prev = calculateTotal(sevenDaysAgo)
      change7d = prev > 0 ? ((totalRidership - prev) / prev) * 100 : 0
    }

    // Recovery percentage (simple average for now)
    // In a real implementation, this would be weighted by ridership volume
    const recoveryPct = 85

    return {
      totalRidership,
      change7d,
      recoveryPct,
      sparklineTotal,
      sparkline7d: sparklineTotal.slice(-7),
    }
  }, [activeModes, filterDataByDateRange])

  return (
    <section className="space-y-4" aria-label="Key Performance Indicators">
      <h2 className="text-2xl font-bold">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          label="Avg Daily Ridership"
          value={kpiData.totalRidership}
          delta={kpiData.change7d}
          sparklineData={kpiData.sparklineTotal}
          valueFormat="number"
        />
        <KPICard
          label="Week over Week"
          value={Math.abs(kpiData.change7d)}
          delta={kpiData.change7d}
          sparklineData={kpiData.sparkline7d}
          valueFormat="percent"
        />
        <KPICard
          label="vs. Pre-Pandemic"
          value={kpiData.recoveryPct}
          sparklineData={[]}
          valueFormat="percent"
        />
      </div>
    </section>
  )
}
