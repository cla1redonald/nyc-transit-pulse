import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FilterProvider, useFilters } from '@/lib/filter-context'
import { RidershipTrendChart } from '@/components/charts/RidershipTrendChart'
import { ModeComparisonChart } from '@/components/charts/ModeComparisonChart'
import { subDays } from 'date-fns'
import type { ReactNode } from 'react'

// Mock Recharts components with data tracking
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data, ...props }: any) => (
    <div data-testid="line-chart" data-length={data?.length} {...props}>
      {children}
    </div>
  ),
  AreaChart: ({ children, data, ...props }: any) => (
    <div data-testid="area-chart" data-length={data?.length} {...props}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name, ...props }: any) => (
    <div data-testid={`line-${dataKey}`} data-name={name} {...props} />
  ),
  Area: ({ dataKey, name, ...props }: any) => (
    <div data-testid={`area-${dataKey}`} data-name={name} {...props} />
  ),
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
}))

// Helper component to trigger filter changes
function FilterController({ children }: { children: ReactNode }) {
  const { setPreset, toggleMode } = useFilters()

  return (
    <div>
      <button data-testid="set-7d" onClick={() => setPreset('7d')}>
        7 Days
      </button>
      <button data-testid="set-30d" onClick={() => setPreset('30d')}>
        30 Days
      </button>
      <button data-testid="toggle-subway" onClick={() => toggleMode('subway')}>
        Toggle Subway
      </button>
      <button data-testid="toggle-bus" onClick={() => toggleMode('bus')}>
        Toggle Bus
      </button>
      {children}
    </div>
  )
}

describe('RidershipTrendChart Integration', () => {
  it('renders with filter provider and displays data', () => {
    render(
      <FilterProvider>
        <RidershipTrendChart />
      </FilterProvider>
    )

    const lineChart = screen.getByTestId('line-chart')
    const dataLength = parseInt(lineChart.getAttribute('data-length') || '0', 10)
    expect(dataLength).toBeGreaterThan(0)
  })

  it('updates chart data when date range changes', async () => {
    const { rerender } = render(
      <FilterProvider>
        <FilterController>
          <RidershipTrendChart />
        </FilterController>
      </FilterProvider>
    )

    // Get initial data length (default is 1 year)
    const initialChart = screen.getByTestId('line-chart')
    const initialLength = parseInt(initialChart.getAttribute('data-length') || '0', 10)

    // Click to change to 7 days
    const button7d = screen.getByTestId('set-7d')
    button7d.click()

    // Wait for state update and rerender
    await waitFor(() => {
      const updatedChart = screen.getByTestId('line-chart')
      const newLength = parseInt(updatedChart.getAttribute('data-length') || '0', 10)
      // 7 days should have fewer data points than 1 year
      expect(newLength).toBeLessThan(initialLength)
      expect(newLength).toBeGreaterThan(0)
      expect(newLength).toBeLessThanOrEqual(10) // Should be ~7 days
    })
  })

  it('updates chart data when date range changes to 30 days', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <RidershipTrendChart />
        </FilterController>
      </FilterProvider>
    )

    // Click to change to 30 days
    const button30d = screen.getByTestId('set-30d')
    button30d.click()

    // Wait for state update
    await waitFor(() => {
      const chart = screen.getByTestId('line-chart')
      const length = parseInt(chart.getAttribute('data-length') || '0', 10)
      expect(length).toBeGreaterThan(0)
      expect(length).toBeLessThanOrEqual(35) // Should be ~30 days
    })
  })

  it('removes line when mode is toggled off', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <RidershipTrendChart />
        </FilterController>
      </FilterProvider>
    )

    // Verify subway line exists initially
    expect(screen.getByTestId('line-subway')).toBeInTheDocument()

    // Toggle subway off
    const toggleButton = screen.getByTestId('toggle-subway')
    toggleButton.click()

    // Wait for line to be removed
    await waitFor(() => {
      expect(screen.queryByTestId('line-subway')).not.toBeInTheDocument()
    })

    // Toggle subway back on
    toggleButton.click()

    // Wait for line to reappear
    await waitFor(() => {
      expect(screen.getByTestId('line-subway')).toBeInTheDocument()
    })
  })

  it('handles multiple mode toggles', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <RidershipTrendChart />
        </FilterController>
      </FilterProvider>
    )

    // Both should exist initially
    expect(screen.getByTestId('line-subway')).toBeInTheDocument()
    expect(screen.getByTestId('line-bus')).toBeInTheDocument()

    // Toggle both off
    screen.getByTestId('toggle-subway').click()
    screen.getByTestId('toggle-bus').click()

    await waitFor(() => {
      expect(screen.queryByTestId('line-subway')).not.toBeInTheDocument()
      expect(screen.queryByTestId('line-bus')).not.toBeInTheDocument()
    })
  })
})

describe('ModeComparisonChart Integration', () => {
  it('renders with filter provider and displays data', () => {
    render(
      <FilterProvider>
        <ModeComparisonChart />
      </FilterProvider>
    )

    const areaChart = screen.getByTestId('area-chart')
    const dataLength = parseInt(areaChart.getAttribute('data-length') || '0', 10)
    expect(dataLength).toBeGreaterThan(0)
  })

  it('updates chart data when date range changes', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <ModeComparisonChart />
        </FilterController>
      </FilterProvider>
    )

    // Get initial data length
    const initialChart = screen.getByTestId('area-chart')
    const initialLength = parseInt(initialChart.getAttribute('data-length') || '0', 10)

    // Change to 7 days
    screen.getByTestId('set-7d').click()

    await waitFor(() => {
      const updatedChart = screen.getByTestId('area-chart')
      const newLength = parseInt(updatedChart.getAttribute('data-length') || '0', 10)
      expect(newLength).toBeLessThan(initialLength)
      expect(newLength).toBeLessThanOrEqual(10)
    })
  })

  it('removes stacked areas when modes are toggled off', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <ModeComparisonChart />
        </FilterController>
      </FilterProvider>
    )

    // Verify subway area exists initially
    expect(screen.getByTestId('area-subway')).toBeInTheDocument()

    // Toggle subway off
    screen.getByTestId('toggle-subway').click()

    // Wait for area to be removed
    await waitFor(() => {
      expect(screen.queryByTestId('area-subway')).not.toBeInTheDocument()
    })

    // Other modes should still exist
    expect(screen.getByTestId('area-bus')).toBeInTheDocument()
  })

  it('handles combined date range and mode filter changes', async () => {
    render(
      <FilterProvider>
        <FilterController>
          <ModeComparisonChart />
        </FilterController>
      </FilterProvider>
    )

    // Change date range
    screen.getByTestId('set-30d').click()

    // Toggle a mode
    screen.getByTestId('toggle-bus').click()

    await waitFor(() => {
      const chart = screen.getByTestId('area-chart')
      const length = parseInt(chart.getAttribute('data-length') || '0', 10)

      // Should have 30 days of data
      expect(length).toBeLessThanOrEqual(35)

      // Bus area should be gone
      expect(screen.queryByTestId('area-bus')).not.toBeInTheDocument()

      // Other modes should still exist
      expect(screen.getByTestId('area-subway')).toBeInTheDocument()
    })
  })
})
