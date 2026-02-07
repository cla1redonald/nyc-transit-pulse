import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StationMarker } from '@/components/map/StationMarker'
import { StationPopover } from '@/components/map/StationPopover'
import { MapLegend } from '@/components/map/MapLegend'
import type { StationData } from '@/types/transit'

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children, ...props }: any) => (
    <div data-testid={`marker-${props['data-station']}`} data-radius={props.radius}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ setView: vi.fn() }),
}))

// Mock leaflet CSS import
vi.mock('leaflet/dist/leaflet.css', () => ({}))

const mockStation: StationData = {
  id: 'times-sq-42',
  name: 'Times Square-42 St',
  lat: 40.758,
  lng: -73.9855,
  lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
  borough: 'Manhattan',
  avgDailyRidership: 175000,
  recoveryPct: 83,
}

const mockStationLow: StationData = {
  id: 'jay-st-metrotech',
  name: 'Jay St-MetroTech',
  lat: 40.6922,
  lng: -73.9862,
  lines: ['A', 'C', 'F', 'R'],
  borough: 'Brooklyn',
  avgDailyRidership: 60000,
  recoveryPct: 82,
}

describe('StationMarker', () => {
  it('renders a CircleMarker with correct station data', () => {
    render(<StationMarker station={mockStation} />)
    expect(screen.getByTestId('marker-times-sq-42')).toBeInTheDocument()
  })

  it('renders different sizes based on ridership', () => {
    const { rerender } = render(<StationMarker station={mockStation} />)
    const highRidershipMarker = screen.getByTestId('marker-times-sq-42')
    const highRadius = highRidershipMarker.getAttribute('data-radius')

    rerender(<StationMarker station={mockStationLow} />)
    const lowRidershipMarker = screen.getByTestId('marker-jay-st-metrotech')
    const lowRadius = lowRidershipMarker.getAttribute('data-radius')

    // High ridership should have larger radius than low ridership
    expect(Number(highRadius)).toBeGreaterThan(Number(lowRadius))
  })

  it('renders a popup with station details', () => {
    render(<StationMarker station={mockStation} />)
    expect(screen.getByTestId('popup')).toBeInTheDocument()
    expect(screen.getByText('Times Square-42 St')).toBeInTheDocument()
  })
})

describe('StationPopover', () => {
  it('renders station name', () => {
    render(<StationPopover station={mockStation} />)
    expect(screen.getByText('Times Square-42 St')).toBeInTheDocument()
  })

  it('renders all subway lines with colored bullets', () => {
    render(<StationPopover station={mockStation} />)

    // Check that all lines are rendered
    mockStation.lines.forEach((line) => {
      expect(screen.getByText(line)).toBeInTheDocument()
    })
  })

  it('renders borough information', () => {
    render(<StationPopover station={mockStation} />)
    expect(screen.getByText('Borough:')).toBeInTheDocument()
    expect(screen.getByText('Manhattan')).toBeInTheDocument()
  })

  it('renders formatted daily ridership', () => {
    render(<StationPopover station={mockStation} />)
    expect(screen.getByText('Daily Ridership:')).toBeInTheDocument()
    expect(screen.getByText('175,000')).toBeInTheDocument()
  })

  it('shows "Top 15 busiest station" badge for high ridership stations', () => {
    render(<StationPopover station={mockStation} />)
    expect(screen.getByText('Top 15 busiest station')).toBeInTheDocument()
  })

  it('does not show badge for lower ridership stations', () => {
    render(<StationPopover station={mockStationLow} />)
    expect(screen.queryByText('Top 15 busiest station')).not.toBeInTheDocument()
  })
})

describe('MapLegend', () => {
  it('renders the legend with title', () => {
    render(<MapLegend />)
    expect(screen.getByText('Ridership Intensity')).toBeInTheDocument()
  })

  it('renders gradient scale with labels', () => {
    render(<MapLegend />)
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('has correct positioning classes', () => {
    const { container } = render(<MapLegend />)
    const legend = container.querySelector('.absolute.bottom-6.right-6')
    expect(legend).toBeInTheDocument()
  })
})

describe('StationMap Integration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should render within FilterProvider', async () => {
    const { FilterProvider } = await import('@/lib/filter-context')
    const { StationMap } = await import('@/components/map/StationMap')

    render(
      <FilterProvider>
        <StationMap />
      </FilterProvider>
    )

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
  })

  it('should render all station markers', async () => {
    const { FilterProvider } = await import('@/lib/filter-context')
    const { StationMap } = await import('@/components/map/StationMap')

    render(
      <FilterProvider>
        <StationMap />
      </FilterProvider>
    )

    // Check that at least some markers are rendered (based on stations.json)
    expect(screen.getByTestId('marker-times-sq-42')).toBeInTheDocument()
    expect(screen.getByTestId('marker-grand-central-42')).toBeInTheDocument()
  })

  it('should render map legend', async () => {
    const { FilterProvider } = await import('@/lib/filter-context')
    const { StationMap } = await import('@/components/map/StationMap')

    render(
      <FilterProvider>
        <StationMap />
      </FilterProvider>
    )

    expect(screen.getByText('Ridership Intensity')).toBeInTheDocument()
  })
})
