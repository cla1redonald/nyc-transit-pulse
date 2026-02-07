import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RidershipTrendChart } from '@/components/charts/RidershipTrendChart'
import { ModeComparisonChart } from '@/components/charts/ModeComparisonChart'
import { FilterProvider } from '@/lib/filter-context'

// Mock Recharts components
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

describe('RidershipTrendChart', () => {
  it('renders without crashing', () => {
    render(
      <FilterProvider>
        <RidershipTrendChart />
      </FilterProvider>
    )

    expect(screen.getByText('Ridership Trends')).toBeInTheDocument()
    expect(screen.getByText('Daily ridership by transit mode')).toBeInTheDocument()
  })

  it('renders chart components', () => {
    render(
      <FilterProvider>
        <RidershipTrendChart />
      </FilterProvider>
    )

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders lines for all default active modes', () => {
    render(
      <FilterProvider>
        <RidershipTrendChart />
      </FilterProvider>
    )

    // All 7 modes should be active by default
    expect(screen.getByTestId('line-subway')).toBeInTheDocument()
    expect(screen.getByTestId('line-bus')).toBeInTheDocument()
    expect(screen.getByTestId('line-lirr')).toBeInTheDocument()
    expect(screen.getByTestId('line-metroNorth')).toBeInTheDocument()
    expect(screen.getByTestId('line-accessARide')).toBeInTheDocument()
    expect(screen.getByTestId('line-bridgesTunnels')).toBeInTheDocument()
    expect(screen.getByTestId('line-sir')).toBeInTheDocument()
  })

  it('has data loaded in the chart', () => {
    render(
      <FilterProvider>
        <RidershipTrendChart />
      </FilterProvider>
    )

    const lineChart = screen.getByTestId('line-chart')
    const dataLength = lineChart.getAttribute('data-length')
    expect(dataLength).not.toBe('0')
    expect(parseInt(dataLength || '0', 10)).toBeGreaterThan(0)
  })
})

describe('ModeComparisonChart', () => {
  it('renders without crashing', () => {
    render(
      <FilterProvider>
        <ModeComparisonChart />
      </FilterProvider>
    )

    expect(screen.getByText('Mode Composition')).toBeInTheDocument()
    expect(screen.getByText('Stacked ridership by transit mode over time')).toBeInTheDocument()
  })

  it('renders chart components', () => {
    render(
      <FilterProvider>
        <ModeComparisonChart />
      </FilterProvider>
    )

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders areas for all default active modes', () => {
    render(
      <FilterProvider>
        <ModeComparisonChart />
      </FilterProvider>
    )

    // All 7 modes should be active by default
    expect(screen.getByTestId('area-subway')).toBeInTheDocument()
    expect(screen.getByTestId('area-bus')).toBeInTheDocument()
    expect(screen.getByTestId('area-lirr')).toBeInTheDocument()
    expect(screen.getByTestId('area-metroNorth')).toBeInTheDocument()
    expect(screen.getByTestId('area-accessARide')).toBeInTheDocument()
    expect(screen.getByTestId('area-bridgesTunnels')).toBeInTheDocument()
    expect(screen.getByTestId('area-sir')).toBeInTheDocument()
  })

  it('has data loaded in the chart', () => {
    render(
      <FilterProvider>
        <ModeComparisonChart />
      </FilterProvider>
    )

    const areaChart = screen.getByTestId('area-chart')
    const dataLength = areaChart.getAttribute('data-length')
    expect(dataLength).not.toBe('0')
    expect(parseInt(dataLength || '0', 10)).toBeGreaterThan(0)
  })
})
