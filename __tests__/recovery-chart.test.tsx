import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PandemicRecoveryChart } from '@/components/charts/PandemicRecoveryChart'
import { FilterProvider } from '@/lib/filter-context'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-length={data?.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, name }: any) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({ y, x, label }: any) => (
    <div
      data-testid={y ? `reference-line-${y}` : x ? `reference-line-${x}` : 'reference-line'}
      data-label={label?.value || label}
    />
  ),
}))

describe('PandemicRecoveryChart', () => {
  it('renders without crashing', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    // Chart should render without crashing
    // Note: Headings are now in page.tsx, not in the chart component
    expect(document.body).toBeTruthy()
  })

  it('renders chart components', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
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

  it('shows 100% reference line', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    const referenceLine = screen.getByTestId('reference-line-100')
    expect(referenceLine).toBeInTheDocument()
  })

  it('renders recovery percentage areas for all default active modes', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    // All 7 modes should be active by default
    expect(screen.getByTestId('area-subwayPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-busPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-lirrPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-metroNorthPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-accessARidePct')).toBeInTheDocument()
    expect(screen.getByTestId('area-bridgesTunnelsPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-sirPct')).toBeInTheDocument()
  })

  it('has data loaded in the chart', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    const areaChart = screen.getByTestId('area-chart')
    const dataLength = areaChart.getAttribute('data-length')
    expect(dataLength).not.toBe('0')
    expect(parseInt(dataLength || '0', 10)).toBeGreaterThan(0)
  })

  it('renders recovery KPI bars section', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    expect(screen.getByText('Current Recovery Status')).toBeInTheDocument()

    // Check for mode labels in recovery bars
    expect(screen.getByText('Subway')).toBeInTheDocument()
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.getByText('LIRR')).toBeInTheDocument()
    expect(screen.getByText('Metro-North')).toBeInTheDocument()
    expect(screen.getByText('Access-A-Ride')).toBeInTheDocument()
    expect(screen.getByText('Bridges & Tunnels')).toBeInTheDocument()
    expect(screen.getByText('Staten Island Railway')).toBeInTheDocument()
  })

  it('shows event markers', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    // Event markers are rendered as reference lines with x values
    // The exact event dates should be in the DOM
    const allReferenceLines = screen.getAllByTestId(/reference-line/)
    expect(allReferenceLines.length).toBeGreaterThan(1) // At least 100% line + event markers
  })
})

describe('PandemicRecoveryChart - Integration', () => {
  it('areas are conditionally rendered based on active modes', () => {
    render(
      <FilterProvider>
        <PandemicRecoveryChart />
      </FilterProvider>
    )

    // All modes should render areas when active
    expect(screen.getByTestId('area-subwayPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-busPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-lirrPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-metroNorthPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-accessARidePct')).toBeInTheDocument()
    expect(screen.getByTestId('area-bridgesTunnelsPct')).toBeInTheDocument()
    expect(screen.getByTestId('area-sirPct')).toBeInTheDocument()
  })
})
