'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useFilters } from '@/lib/filter-context'
import { MODE_COLORS, MODE_LABELS } from '@/lib/colors'
import { formatCompactNumber } from '@/lib/format'
import { CustomTooltip } from './CustomTooltip'
import type { DailyRidership, TransitMode } from '@/types/transit'

// Import data
import dailyData from '@/data/daily.json'

export function RidershipTrendChart() {
  const { filterDataByDateRange, activeModes } = useFilters()

  // Filter and process data
  const chartData = useMemo(() => {
    const filtered = filterDataByDateRange(dailyData as DailyRidership[])
    return filtered
  }, [filterDataByDateRange])

  // Get active modes as array for line rendering
  const activeModesArray = useMemo(() => Array.from(activeModes), [activeModes])

  if (!chartData.length) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-muted-foreground">No data available for selected date range</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Ridership Trends</h3>
        <p className="text-sm text-muted-foreground">Daily ridership by transit mode</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
            minTickGap={30}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
            )}
          />

          {/* Render lines only for active modes */}
          {activeModesArray.includes('subway' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="subway"
              name={MODE_LABELS.subway}
              stroke={MODE_COLORS.subway}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('bus' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="bus"
              name={MODE_LABELS.bus}
              stroke={MODE_COLORS.bus}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('lirr' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="lirr"
              name={MODE_LABELS.lirr}
              stroke={MODE_COLORS.lirr}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('metroNorth' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="metroNorth"
              name={MODE_LABELS.metroNorth}
              stroke={MODE_COLORS.metroNorth}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('accessARide' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="accessARide"
              name={MODE_LABELS.accessARide}
              stroke={MODE_COLORS.accessARide}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('bridgesTunnels' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="bridgesTunnels"
              name={MODE_LABELS.bridgesTunnels}
              stroke={MODE_COLORS.bridgesTunnels}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {activeModesArray.includes('sir' as TransitMode) && (
            <Line
              type="monotone"
              dataKey="sir"
              name={MODE_LABELS.sir}
              stroke={MODE_COLORS.sir}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
