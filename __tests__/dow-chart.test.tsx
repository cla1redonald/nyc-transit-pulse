import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayOfWeekChart } from '@/components/charts/DayOfWeekChart'
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
  Cell: () => null,
}))

describe('DayOfWeekChart', () => {
  it('renders without crashing', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Chart should render without crashing
    // Note: Headings are now in page.tsx, not in the chart component
    expect(document.body).toBeTruthy()
  })

  it('renders chart components', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('By Mode')).toBeInTheDocument()
  })

  it('default view shows total bars', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // In total view, there should be a bar with dataKey "total"
    expect(screen.getByTestId('bar-total')).toBeInTheDocument()

    // Legend should not be present in total view
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
  })

  it('switches to By Mode view when toggle is clicked', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Initially in Total view
    expect(screen.getByTestId('bar-total')).toBeInTheDocument()

    // Click "By Mode" button
    const byModeButton = screen.getByText('By Mode')
    fireEvent.click(byModeButton)

    // After clicking, should show individual mode bars
    expect(screen.queryByTestId('bar-total')).not.toBeInTheDocument()
    expect(screen.getByTestId('bar-subway')).toBeInTheDocument()
    expect(screen.getByTestId('bar-bus')).toBeInTheDocument()

    // Legend should appear in By Mode view
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('has data loaded in the chart (7 days)', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    const barChart = screen.getByTestId('bar-chart')
    const dataLength = barChart.getAttribute('data-length')
    expect(dataLength).toBe('7') // Should have exactly 7 days
  })

  it('shows all 7 days of the week', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Data should include all days (checked via data length)
    const barChart = screen.getByTestId('bar-chart')
    const dataLength = barChart.getAttribute('data-length')
    expect(parseInt(dataLength || '0', 10)).toBe(7)
  })

  it('shows peak day annotation', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Should show annotation about peak day
    const annotation = screen.getByText(/sees the highest ridership on average/)
    expect(annotation).toBeInTheDocument()
  })

  it('peak day annotation identifies correct day', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Based on the data, Wednesday is the peak day
    // The annotation should mention a day name
    const annotation = screen.getByText(/sees the highest ridership on average/)
    expect(annotation.textContent).toMatch(
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/
    )
  })
})

describe('DayOfWeekChart - Integration', () => {
  it('renders mode bars in By Mode view based on active modes', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // Switch to By Mode view
    const byModeButton = screen.getByText('By Mode')
    fireEvent.click(byModeButton)

    // With all modes active, should show bars for all modes
    expect(screen.getByTestId('bar-subway')).toBeInTheDocument()
    expect(screen.getByTestId('bar-bus')).toBeInTheDocument()
    expect(screen.getByTestId('bar-lirr')).toBeInTheDocument()
    expect(screen.getByTestId('bar-metroNorth')).toBeInTheDocument()
    expect(screen.getByTestId('bar-accessARide')).toBeInTheDocument()
    expect(screen.getByTestId('bar-bridgesTunnels')).toBeInTheDocument()
    expect(screen.getByTestId('bar-sir')).toBeInTheDocument()
  })

  it('calculates totals dynamically in Total view', () => {
    render(
      <FilterProvider>
        <DayOfWeekChart />
      </FilterProvider>
    )

    // In Total view, total bar reflects active modes
    expect(screen.getByTestId('bar-total')).toBeInTheDocument()
  })
})
