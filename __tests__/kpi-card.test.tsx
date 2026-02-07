import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KPICard } from '@/components/kpi/KPICard'

describe('KPICard', () => {
  it('renders label and value', async () => {
    render(<KPICard label="Total Ridership" value={1234567} />)

    expect(screen.getByText('Total Ridership')).toBeInTheDocument()
    // Value animates in, so we wait for it to appear
    await waitFor(
      () => {
        expect(screen.getByText(/1,234,567/)).toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('renders percentage format correctly', async () => {
    render(<KPICard label="Recovery" value={85.4} valueFormat="percent" />)

    expect(screen.getByText('Recovery')).toBeInTheDocument()
    await waitFor(
      () => {
        expect(screen.getByText(/85\.4%/)).toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('shows positive delta with arrow', () => {
    render(<KPICard label="Test" value={100} delta={5.2} />)

    expect(screen.getByText('+5.2%')).toBeInTheDocument()
  })

  it('shows negative delta with arrow', () => {
    render(<KPICard label="Test" value={100} delta={-3.1} />)

    expect(screen.getByText('-3.1%')).toBeInTheDocument()
  })

  it('renders sparkline when data provided', () => {
    const sparklineData = [10, 20, 30, 40, 50]
    const { container } = render(
      <KPICard label="Test" value={100} sparklineData={sparklineData} />
    )

    // Should render sparkline bars
    const bars = container.querySelectorAll('[aria-hidden="true"] > div')
    expect(bars.length).toBe(sparklineData.length)
  })

  it('does not render sparkline when no data', () => {
    const { container } = render(<KPICard label="Test" value={100} />)

    const sparkline = container.querySelector('[aria-hidden="true"]')
    expect(sparkline).not.toBeInTheDocument()
  })
})
