import { describe, it, expect } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { FilterProvider, useFilters } from '@/lib/filter-context'
import type { TransitMode } from '@/types/transit'

describe('FilterContext', () => {
  it('provides default filter state', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    expect(result.current.dateRange.preset).toBe('1y')
    expect(result.current.activeModes.size).toBe(7) // All modes active by default
    expect(result.current.rollingAverage).toBe(false)
  })

  it('updates date range preset', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    act(() => {
      result.current.setPreset('30d')
    })

    expect(result.current.dateRange.preset).toBe('30d')
  })

  it('toggles modes on and off', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    const initialSize = result.current.activeModes.size

    act(() => {
      result.current.toggleMode('subway')
    })

    expect(result.current.activeModes.size).toBe(initialSize - 1)
    expect(result.current.activeModes.has('subway')).toBe(false)

    act(() => {
      result.current.toggleMode('subway')
    })

    expect(result.current.activeModes.size).toBe(initialSize)
    expect(result.current.activeModes.has('subway')).toBe(true)
  })

  it('prevents deselecting all modes', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    // Deselect all but one mode
    const modes: TransitMode[] = [
      'bus',
      'lirr',
      'metroNorth',
      'accessARide',
      'bridgesTunnels',
      'sir',
    ]

    act(() => {
      modes.forEach((mode) => result.current.toggleMode(mode))
    })

    expect(result.current.activeModes.size).toBe(1)

    // Try to deselect the last mode
    act(() => {
      result.current.toggleMode('subway')
    })

    // Should still have 1 mode
    expect(result.current.activeModes.size).toBe(1)
  })

  it('filters data by date range', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    const mockData = [
      { date: '2024-01-01', value: 100 },
      { date: '2024-06-01', value: 200 },
      { date: '2025-01-01', value: 300 },
    ]

    act(() => {
      result.current.setPreset('30d') // Last 30 days
    })

    const filtered = result.current.filterDataByDateRange(mockData)

    // Should only include recent data
    expect(filtered.length).toBeLessThan(mockData.length)
  })

  it('computes date range for presets correctly', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    })

    const range7d = result.current.computeDateRange('7d')
    const diffDays7d = Math.ceil(
      (range7d.end.getTime() - range7d.start.getTime()) / (1000 * 60 * 60 * 24)
    )
    expect(diffDays7d).toBe(7)

    const range30d = result.current.computeDateRange('30d')
    const diffDays30d = Math.ceil(
      (range30d.end.getTime() - range30d.start.getTime()) / (1000 * 60 * 60 * 24)
    )
    expect(diffDays30d).toBe(30)

    const rangeAll = result.current.computeDateRange('all')
    expect(rangeAll.start.getFullYear()).toBe(2020)
  })
})
