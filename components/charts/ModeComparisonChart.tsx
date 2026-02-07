'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useFilters } from '@/lib/filter-context'
import { MODE_COLORS, MODE_LABELS } from '@/lib/colors'
import { formatCompactNumber, formatNumber } from '@/lib/format'
import type { DailyRidership, TransitMode } from '@/types/transit'

// Import data
import dailyData from '@/data/daily.json'

interface TooltipPayload {
  name: string
  value: number
  color: string
  dataKey: string
}

interface CustomStackedTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomStackedTooltip({ active, payload, label }: CustomStackedTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  // Calculate total
  const total = payload.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div
      className="rounded-lg border border-border p-3 shadow-lg"
      style={{
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {label && (
        <p className="mb-2 text-sm font-medium text-foreground">
          {new Date(label).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
      <div className="mb-2 border-b border-border pb-2">
        <span className="text-xs text-muted-foreground">Total: </span>
        <span className="text-xs font-semibold text-foreground">
          {formatNumber(total)}
        </span>
      </div>
      <div className="space-y-1">
        {payload
          .slice()
          .reverse()
          .map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1)
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {formatNumber(entry.value)}
                  </span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export function ModeComparisonChart() {
  const { filterDataByDateRange, activeModes } = useFilters()

  // Filter data
  const chartData = useMemo(() => {
    const filtered = filterDataByDateRange(dailyData as DailyRidership[])
    return filtered
  }, [filterDataByDateRange])

  // Get active modes as array
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
        <h3 className="text-lg font-semibold text-foreground">Mode Composition</h3>
        <p className="text-sm text-muted-foreground">
          Stacked ridership by transit mode over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
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
          <Tooltip content={<CustomStackedTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
            )}
          />

          {/* Render areas only for active modes - order matters for stacking */}
          {activeModesArray.includes('subway' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="subway"
              name={MODE_LABELS.subway}
              stackId="1"
              stroke={MODE_COLORS.subway}
              fill={MODE_COLORS.subway}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('bus' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="bus"
              name={MODE_LABELS.bus}
              stackId="1"
              stroke={MODE_COLORS.bus}
              fill={MODE_COLORS.bus}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('lirr' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="lirr"
              name={MODE_LABELS.lirr}
              stackId="1"
              stroke={MODE_COLORS.lirr}
              fill={MODE_COLORS.lirr}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('metroNorth' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="metroNorth"
              name={MODE_LABELS.metroNorth}
              stackId="1"
              stroke={MODE_COLORS.metroNorth}
              fill={MODE_COLORS.metroNorth}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('accessARide' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="accessARide"
              name={MODE_LABELS.accessARide}
              stackId="1"
              stroke={MODE_COLORS.accessARide}
              fill={MODE_COLORS.accessARide}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('bridgesTunnels' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="bridgesTunnels"
              name={MODE_LABELS.bridgesTunnels}
              stackId="1"
              stroke={MODE_COLORS.bridgesTunnels}
              fill={MODE_COLORS.bridgesTunnels}
              fillOpacity={0.8}
            />
          )}
          {activeModesArray.includes('sir' as TransitMode) && (
            <Area
              type="monotone"
              dataKey="sir"
              name={MODE_LABELS.sir}
              stackId="1"
              stroke={MODE_COLORS.sir}
              fill={MODE_COLORS.sir}
              fillOpacity={0.8}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
