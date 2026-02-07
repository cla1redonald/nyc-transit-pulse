import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type {
  DailyRidership,
  WeeklyRidership,
  MonthlyRidership,
  DayOfWeekData,
  RecoveryData,
  KPIData,
  CongestionPricingData,
  StationData,
} from '../types/transit'

describe('Data Processing', () => {
  const dataDir = path.join(process.cwd(), 'data')

  describe('Daily Data', () => {
    it('should generate daily.json with valid structure', () => {
      const dailyPath = path.join(dataDir, 'daily.json')
      expect(fs.existsSync(dailyPath)).toBe(true)

      const data: DailyRidership[] = JSON.parse(fs.readFileSync(dailyPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      const first = data[0]
      expect(first).toHaveProperty('date')
      expect(first).toHaveProperty('subway')
      expect(first).toHaveProperty('bus')
      expect(first).toHaveProperty('lirr')
      expect(first).toHaveProperty('metroNorth')
      expect(first).toHaveProperty('accessARide')
      expect(first).toHaveProperty('bridgesTunnels')
      expect(first).toHaveProperty('sir')
      expect(first).toHaveProperty('total')

      // Verify total calculation
      const calculatedTotal =
        first.subway +
        first.bus +
        first.lirr +
        first.metroNorth +
        first.accessARide +
        first.bridgesTunnels +
        first.sir
      expect(first.total).toBeCloseTo(calculatedTotal, 0)
    })

    it('should have dates in chronological order', () => {
      const dailyPath = path.join(dataDir, 'daily.json')
      const data: DailyRidership[] = JSON.parse(fs.readFileSync(dailyPath, 'utf-8'))

      for (let i = 1; i < data.length; i++) {
        expect(data[i].date >= data[i - 1].date).toBe(true)
      }
    })

    it('should have valid numeric values', () => {
      const dailyPath = path.join(dataDir, 'daily.json')
      const data: DailyRidership[] = JSON.parse(fs.readFileSync(dailyPath, 'utf-8'))

      data.forEach((day) => {
        expect(day.subway).toBeGreaterThanOrEqual(0)
        expect(day.bus).toBeGreaterThanOrEqual(0)
        expect(day.lirr).toBeGreaterThanOrEqual(0)
        expect(day.metroNorth).toBeGreaterThanOrEqual(0)
        expect(day.accessARide).toBeGreaterThanOrEqual(0)
        expect(day.bridgesTunnels).toBeGreaterThanOrEqual(0)
        expect(day.sir).toBeGreaterThanOrEqual(0)
        expect(day.total).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Recovery Data', () => {
    it('should generate recovery.json with valid structure', () => {
      const recoveryPath = path.join(dataDir, 'recovery.json')
      expect(fs.existsSync(recoveryPath)).toBe(true)

      const data: RecoveryData[] = JSON.parse(fs.readFileSync(recoveryPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      const first = data[0]
      expect(first).toHaveProperty('date')
      expect(first).toHaveProperty('subwayPct')
      expect(first).toHaveProperty('busPct')
      expect(first).toHaveProperty('lirrPct')
      expect(first).toHaveProperty('metroNorthPct')
      expect(first).toHaveProperty('accessARidePct')
      expect(first).toHaveProperty('bridgesTunnelsPct')
      expect(first).toHaveProperty('sirPct')
    })

    it('should have recovery percentages as decimals', () => {
      const recoveryPath = path.join(dataDir, 'recovery.json')
      const data: RecoveryData[] = JSON.parse(fs.readFileSync(recoveryPath, 'utf-8'))

      // Check that percentages are in decimal form (0-2 range, accounting for Access-A-Ride at 161%)
      data.forEach((day) => {
        expect(day.subwayPct).toBeGreaterThanOrEqual(0)
        expect(day.subwayPct).toBeLessThanOrEqual(2)
        expect(day.busPct).toBeGreaterThanOrEqual(0)
        expect(day.accessARidePct).toBeGreaterThanOrEqual(0) // Can exceed 1.0
      })
    })
  })

  describe('Weekly Data', () => {
    it('should generate weekly.json with valid structure', () => {
      const weeklyPath = path.join(dataDir, 'weekly.json')
      expect(fs.existsSync(weeklyPath)).toBe(true)

      const data: WeeklyRidership[] = JSON.parse(fs.readFileSync(weeklyPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      const first = data[0]
      expect(first).toHaveProperty('weekStart')
      expect(first).toHaveProperty('weekEnd')
      expect(first).toHaveProperty('total')
    })
  })

  describe('Monthly Data', () => {
    it('should generate monthly.json with valid structure', () => {
      const monthlyPath = path.join(dataDir, 'monthly.json')
      expect(fs.existsSync(monthlyPath)).toBe(true)

      const data: MonthlyRidership[] = JSON.parse(fs.readFileSync(monthlyPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      const first = data[0]
      expect(first).toHaveProperty('month')
      expect(first.month).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  describe('Day of Week Data', () => {
    it('should generate dow.json with all 7 days', () => {
      const dowPath = path.join(dataDir, 'dow.json')
      expect(fs.existsSync(dowPath)).toBe(true)

      const data: DayOfWeekData[] = JSON.parse(fs.readFileSync(dowPath, 'utf-8'))
      expect(data.length).toBe(7)

      const days = data.map((d) => d.dayOfWeek)
      expect(days).toContain('Monday')
      expect(days).toContain('Tuesday')
      expect(days).toContain('Wednesday')
      expect(days).toContain('Thursday')
      expect(days).toContain('Friday')
      expect(days).toContain('Saturday')
      expect(days).toContain('Sunday')
    })

    it('should have valid average values', () => {
      const dowPath = path.join(dataDir, 'dow.json')
      const data: DayOfWeekData[] = JSON.parse(fs.readFileSync(dowPath, 'utf-8'))

      data.forEach((day) => {
        expect(day.avgSubway).toBeGreaterThanOrEqual(0)
        expect(day.avgBus).toBeGreaterThanOrEqual(0)
        expect(day.avgTotal).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('KPI Data', () => {
    it('should generate kpi.json with valid structure', () => {
      const kpiPath = path.join(dataDir, 'kpi.json')
      expect(fs.existsSync(kpiPath)).toBe(true)

      const data: KPIData = JSON.parse(fs.readFileSync(kpiPath, 'utf-8'))
      expect(data).toHaveProperty('totalRidership')
      expect(data).toHaveProperty('change7d')
      expect(data).toHaveProperty('change30d')
      expect(data).toHaveProperty('recoveryPct')
      expect(data).toHaveProperty('byMode')

      expect(data.totalRidership).toBeGreaterThan(0)
      expect(data.recoveryPct).toBeGreaterThan(0)
      expect(data.recoveryPct).toBeLessThan(200) // Should be under 200%
    })

    it('should have data for all 7 modes', () => {
      const kpiPath = path.join(dataDir, 'kpi.json')
      const data: KPIData = JSON.parse(fs.readFileSync(kpiPath, 'utf-8'))

      expect(data.byMode).toHaveProperty('subway')
      expect(data.byMode).toHaveProperty('bus')
      expect(data.byMode).toHaveProperty('lirr')
      expect(data.byMode).toHaveProperty('metroNorth')
      expect(data.byMode).toHaveProperty('accessARide')
      expect(data.byMode).toHaveProperty('bridgesTunnels')
      expect(data.byMode).toHaveProperty('sir')
    })
  })

  describe('Congestion Pricing Data', () => {
    it('should generate congestion-pricing.json', () => {
      const cpPath = path.join(dataDir, 'congestion-pricing.json')
      expect(fs.existsSync(cpPath)).toBe(true)

      const data: CongestionPricingData[] = JSON.parse(fs.readFileSync(cpPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      data.forEach((event) => {
        expect(event).toHaveProperty('event')
        expect(event).toHaveProperty('date')
        expect(event).toHaveProperty('before30d')
        expect(event).toHaveProperty('after30d')
        expect(event).toHaveProperty('subwayDelta')
        expect(event).toHaveProperty('bridgesDelta')
      })
    })
  })

  describe('Station Data', () => {
    it('should generate stations.json with valid structure', () => {
      const stationsPath = path.join(dataDir, 'stations.json')
      expect(fs.existsSync(stationsPath)).toBe(true)

      const data: StationData[] = JSON.parse(fs.readFileSync(stationsPath, 'utf-8'))
      expect(data.length).toBeGreaterThan(0)

      const first = data[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('name')
      expect(first).toHaveProperty('lat')
      expect(first).toHaveProperty('lng')
      expect(first).toHaveProperty('lines')
      expect(first).toHaveProperty('borough')
      expect(first).toHaveProperty('avgDailyRidership')
      expect(first).toHaveProperty('recoveryPct')

      expect(Array.isArray(first.lines)).toBe(true)
      expect(first.lines.length).toBeGreaterThan(0)
    })

    it('should have valid coordinates', () => {
      const stationsPath = path.join(dataDir, 'stations.json')
      const data: StationData[] = JSON.parse(fs.readFileSync(stationsPath, 'utf-8'))

      data.forEach((station) => {
        // NYC latitude: ~40.5 to 41.0
        expect(station.lat).toBeGreaterThan(40)
        expect(station.lat).toBeLessThan(41)
        // NYC longitude: ~-74.3 to -73.7
        expect(station.lng).toBeGreaterThan(-74.5)
        expect(station.lng).toBeLessThan(-73)
      })
    })
  })

  describe('File Sizes', () => {
    it('should generate reasonably sized JSON files', () => {
      const dailyPath = path.join(dataDir, 'daily.json')
      const dailySize = fs.statSync(dailyPath).size

      // Daily file should be under 1MB (uncompressed)
      expect(dailySize).toBeLessThan(1024 * 1024)

      // Total of all files should be under 2MB
      const files = fs.readdirSync(dataDir)
      const totalSize = files.reduce((sum, file) => {
        const filePath = path.join(dataDir, file)
        return sum + fs.statSync(filePath).size
      }, 0)

      expect(totalSize).toBeLessThan(2 * 1024 * 1024)
    })
  })
})
