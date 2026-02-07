import { describe, it, expect } from 'vitest'
import {
  formatCompactNumber,
  formatNumber,
  formatPercentage,
  formatDate,
  formatMonth,
  formatChange,
  getChangeColor,
} from '../lib/format'

describe('Format Utilities', () => {
  describe('formatCompactNumber', () => {
    it('should format millions', () => {
      expect(formatCompactNumber(1_500_000)).toBe('1.5M')
      expect(formatCompactNumber(3_800_000)).toBe('3.8M')
    })

    it('should format thousands', () => {
      expect(formatCompactNumber(1_500)).toBe('1.5K')
      expect(formatCompactNumber(125_000)).toBe('125.0K')
    })

    it('should format small numbers', () => {
      expect(formatCompactNumber(500)).toBe('500')
      expect(formatCompactNumber(42)).toBe('42')
    })
  })

  describe('formatNumber', () => {
    it('should format with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1000)).toBe('1,000')
    })

    it('should handle small numbers', () => {
      expect(formatNumber(42)).toBe('42')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages with 1 decimal by default', () => {
      expect(formatPercentage(85.3)).toBe('85.3%')
      expect(formatPercentage(12.7)).toBe('12.7%')
    })

    it('should respect custom decimal places', () => {
      expect(formatPercentage(85.35, 2)).toBe('85.35%')
      expect(formatPercentage(12, 0)).toBe('12%')
    })
  })

  describe('formatDate', () => {
    it('should format ISO dates', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
      expect(formatDate('2023-12-31')).toBe('Dec 31, 2023')
    })

    it('should support custom format strings', () => {
      expect(formatDate('2024-01-15', 'yyyy-MM-dd')).toBe('2024-01-15')
      expect(formatDate('2024-01-15', 'MMMM d')).toBe('January 15')
    })
  })

  describe('formatMonth', () => {
    it('should format month strings', () => {
      expect(formatMonth('2024-01')).toBe('Jan 2024')
      expect(formatMonth('2023-12')).toBe('Dec 2023')
    })
  })

  describe('formatChange', () => {
    it('should add + prefix for positive changes', () => {
      expect(formatChange(5.3)).toBe('+5.3%')
      expect(formatChange(12.7)).toBe('+12.7%')
    })

    it('should show - prefix for negative changes', () => {
      expect(formatChange(-5.3)).toBe('-5.3%')
      expect(formatChange(-12.7)).toBe('-12.7%')
    })

    it('should handle zero', () => {
      expect(formatChange(0)).toBe('+0.0%')
    })

    it('should respect custom decimal places', () => {
      expect(formatChange(5.35, 2)).toBe('+5.35%')
      expect(formatChange(-5.3, 0)).toBe('-5%')
    })
  })

  describe('getChangeColor', () => {
    it('should return green for positive changes', () => {
      expect(getChangeColor(5.3)).toBe('text-green-500')
      expect(getChangeColor(0.1)).toBe('text-green-500')
    })

    it('should return red for negative changes', () => {
      expect(getChangeColor(-5.3)).toBe('text-red-500')
      expect(getChangeColor(-0.1)).toBe('text-red-500')
    })

    it('should return muted for zero', () => {
      expect(getChangeColor(0)).toBe('text-muted-foreground')
    })
  })
})
