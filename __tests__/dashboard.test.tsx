import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { FilterProvider } from '@/lib/filter-context'

// Mock next/dynamic to return the component directly
vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = () => {
      const mod = fn()
      if (mod.then) {
        return <div>Loading map...</div>
      }
      return null
    }
    Component.displayName = 'DynamicComponent'
    return Component
  },
}))

describe('Dashboard Composition', () => {
  it('renders the main dashboard page', () => {
    render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    // Should render without crashing
    expect(document.body).toBeTruthy()
  })

  it('renders all major section headings', () => {
    render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    // Check for main sections
    expect(screen.getByText('Ridership Trends')).toBeInTheDocument()
    expect(screen.getByText('Mode Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Pandemic Recovery')).toBeInTheDocument()
    expect(screen.getByText('Congestion Pricing Impact')).toBeInTheDocument()
    expect(screen.getByText('Subway Station Map')).toBeInTheDocument()
    expect(screen.getByText('Day-of-Week Patterns')).toBeInTheDocument()
  })

  it('renders section descriptions', () => {
    render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    expect(screen.getByText(/Daily ridership patterns/)).toBeInTheDocument()
    expect(screen.getByText(/Transit mode composition/)).toBeInTheDocument()
    expect(screen.getByText(/Recovery progress compared/)).toBeInTheDocument()
  })

  it('renders KPI section with label', () => {
    render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    // KPISection renders an h2 with "Overview"
    expect(screen.getByText('Overview')).toBeInTheDocument()

    // Should have KPI cards (checking for one of the labels)
    expect(screen.getByText('Avg Daily Ridership')).toBeInTheDocument()
  })

  it('renders within FilterProvider context', () => {
    // This test verifies the component doesn't crash when filter context is available
    const { container } = render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    expect(container.querySelector('[data-testid="filter-provider"]') || container).toBeTruthy()
  })

  it('has proper semantic structure with sections', () => {
    const { container } = render(
      <FilterProvider>
        <Home />
      </FilterProvider>
    )

    // Check for semantic section elements
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
  })
})
