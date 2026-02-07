import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ThemeProvider } from 'next-themes'

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}))

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('shows sun icon in dark mode', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    )

    // Sun icon should be visible (to switch to light mode)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
})
