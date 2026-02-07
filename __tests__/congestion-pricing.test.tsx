import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CongestionPricingChart } from '@/components/charts/CongestionPricingChart'
import { FilterProvider } from '@/lib/filter-context'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-length={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name }: any) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
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
  Cell: () => null,
}))

describe('CongestionPricingChart', () => {
  it('renders without crashing', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    // Chart should render without crashing
    // Note: Headings are now in page.tsx, not in the chart component
    expect(document.body).toBeTruthy()
  })

  it('renders chart components', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('shows before/after comparison data', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    // With default modes active, should show subway and bridges/tunnels bars
    expect(screen.getByTestId('bar-subway')).toBeInTheDocument()
    expect(screen.getByTestId('bar-bridgesTunnels')).toBeInTheDocument()
  })

  it('has data loaded in the chart', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    const barChart = screen.getByTestId('bar-chart')
    const dataLength = barChart.getAttribute('data-length')
    expect(dataLength).not.toBe('0')
    expect(parseInt(dataLength || '0', 10)).toBeGreaterThan(0)
  })

  it('renders impact summary section', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    expect(screen.getByText('Impact Summary')).toBeInTheDocument()

    // Check for event labels (capitalized)
    expect(screen.getByText('launch')).toBeInTheDocument()
    expect(screen.getByText('pause')).toBeInTheDocument()
  })

  it('shows percentage deltas in impact summary', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    // Should show "Subway:" and "Bridges & Tunnels:" labels in impact cards
    const subwayLabels = screen.getAllByText(/Subway:/)
    expect(subwayLabels.length).toBeGreaterThan(0)

    const bridgesLabels = screen.getAllByText(/Bridges & Tunnels:/)
    expect(bridgesLabels.length).toBeGreaterThan(0)
  })

  it('shows event dates', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    // Check for the launch date
    expect(screen.getByText('2024-01-05')).toBeInTheDocument()
    // Check for the pause date
    expect(screen.getByText('2024-06-05')).toBeInTheDocument()
  })
})

describe('CongestionPricingChart - Integration', () => {
  it('bars are conditionally rendered based on active modes', () => {
    render(
      <FilterProvider>
        <CongestionPricingChart />
      </FilterProvider>
    )

    // With all modes active, subway and bridges/tunnels should render
    expect(screen.getByTestId('bar-subway')).toBeInTheDocument()
    expect(screen.getByTestId('bar-bridgesTunnels')).toBeInTheDocument()
  })
})
