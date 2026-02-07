#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subDays,
  addDays,
} from 'date-fns'
import type {
  MTARawRow,
  DailyRidership,
  WeeklyRidership,
  MonthlyRidership,
  DayOfWeekData,
  RecoveryData,
  KPIData,
  CongestionPricingData,
  StationData,
} from '../types/transit'
import { CONGESTION_PRICING_EVENTS, DAYS_OF_WEEK } from '../lib/constants'

// Helper to parse number from MTA CSV (handles empty strings, commas)
function parseNumber(value: string | undefined): number {
  if (!value || value.trim() === '') return 0
  const cleaned = value.replace(/,/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Helper to parse percentage (already in decimal form in CSV, e.g., 0.85 for 85%)
function parsePercentage(value: string | undefined): number {
  return parseNumber(value) // Already in decimal form
}

// Process daily ridership data
function processDailyData(rows: MTARawRow[]): DailyRidership[] {
  return rows
    .map((row) => {
      const date = parse(row.Date, 'MM/dd/yyyy', new Date())
      const subway = parseNumber(row['Subways: Total Estimated Ridership'])
      const bus = parseNumber(row['Buses: Total Estimated Ridership'])
      const lirr = parseNumber(row['LIRR: Total Estimated Ridership'])
      const metroNorth = parseNumber(row['Metro-North: Total Estimated Ridership'])
      const accessARide = parseNumber(row['Access-A-Ride: Total Scheduled Trips'])
      const bridgesTunnels = parseNumber(row['Bridges and Tunnels: Total Traffic'])
      const sir = parseNumber(row['Staten Island Railway: Total Estimated Ridership'])

      return {
        date: format(date, 'yyyy-MM-dd'),
        subway,
        bus,
        lirr,
        metroNorth,
        accessARide,
        bridgesTunnels,
        sir,
        total: subway + bus + lirr + metroNorth + accessARide + bridgesTunnels + sir,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Process recovery percentage data
function processRecoveryData(rows: MTARawRow[]): RecoveryData[] {
  return rows
    .map((row) => {
      const date = parse(row.Date, 'MM/dd/yyyy', new Date())

      return {
        date: format(date, 'yyyy-MM-dd'),
        subwayPct: parsePercentage(row['Subways: % of Comparable Pre-Pandemic Day']),
        busPct: parsePercentage(row['Buses: % of Comparable Pre-Pandemic Day']),
        lirrPct: parsePercentage(row['LIRR: % of Comparable Pre-Pandemic Day']),
        metroNorthPct: parsePercentage(row['Metro-North: % of Comparable Pre-Pandemic Day']),
        accessARidePct: parsePercentage(row['Access-A-Ride: % of Comparable Pre-Pandemic Day']),
        bridgesTunnelsPct: parsePercentage(
          row['Bridges and Tunnels: % of Comparable Pre-Pandemic Day']
        ),
        sirPct: parsePercentage(row['Staten Island Railway: % of Comparable Pre-Pandemic Day']),
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Aggregate to weekly data
function processWeeklyData(daily: DailyRidership[]): WeeklyRidership[] {
  const weekMap = new Map<string, WeeklyRidership>()

  daily.forEach((day) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    const key = format(weekStart, 'yyyy-MM-dd')

    if (!weekMap.has(key)) {
      weekMap.set(key, {
        weekStart: key,
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        subway: 0,
        bus: 0,
        lirr: 0,
        metroNorth: 0,
        accessARide: 0,
        bridgesTunnels: 0,
        sir: 0,
        total: 0,
      })
    }

    const week = weekMap.get(key)!
    week.subway += day.subway
    week.bus += day.bus
    week.lirr += day.lirr
    week.metroNorth += day.metroNorth
    week.accessARide += day.accessARide
    week.bridgesTunnels += day.bridgesTunnels
    week.sir += day.sir
    week.total += day.total
  })

  return Array.from(weekMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

// Aggregate to monthly data
function processMonthlyData(daily: DailyRidership[]): MonthlyRidership[] {
  const monthMap = new Map<string, MonthlyRidership>()

  daily.forEach((day) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    const key = format(date, 'yyyy-MM')

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: key,
        subway: 0,
        bus: 0,
        lirr: 0,
        metroNorth: 0,
        accessARide: 0,
        bridgesTunnels: 0,
        sir: 0,
        total: 0,
      })
    }

    const month = monthMap.get(key)!
    month.subway += day.subway
    month.bus += day.bus
    month.lirr += day.lirr
    month.metroNorth += day.metroNorth
    month.accessARide += day.accessARide
    month.bridgesTunnels += day.bridgesTunnels
    month.sir += day.sir
    month.total += day.total
  })

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))
}

// Process day-of-week averages
function processDayOfWeekData(daily: DailyRidership[]): DayOfWeekData[] {
  const dowMap = new Map<string, { sum: DailyRidership; count: number }>()

  daily.forEach((day) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    const dow = format(date, 'EEEE') as DayOfWeekData['dayOfWeek']

    if (!dowMap.has(dow)) {
      dowMap.set(dow, {
        sum: {
          date: '',
          subway: 0,
          bus: 0,
          lirr: 0,
          metroNorth: 0,
          accessARide: 0,
          bridgesTunnels: 0,
          sir: 0,
          total: 0,
        },
        count: 0,
      })
    }

    const entry = dowMap.get(dow)!
    entry.sum.subway += day.subway
    entry.sum.bus += day.bus
    entry.sum.lirr += day.lirr
    entry.sum.metroNorth += day.metroNorth
    entry.sum.accessARide += day.accessARide
    entry.sum.bridgesTunnels += day.bridgesTunnels
    entry.sum.sir += day.sir
    entry.sum.total += day.total
    entry.count++
  })

  return DAYS_OF_WEEK.map((dow) => {
    const entry = dowMap.get(dow)
    if (!entry || entry.count === 0) {
      return {
        dayOfWeek: dow,
        avgSubway: 0,
        avgBus: 0,
        avgLirr: 0,
        avgMetroNorth: 0,
        avgAccessARide: 0,
        avgBridgesTunnels: 0,
        avgSir: 0,
        avgTotal: 0,
      }
    }

    return {
      dayOfWeek: dow,
      avgSubway: entry.sum.subway / entry.count,
      avgBus: entry.sum.bus / entry.count,
      avgLirr: entry.sum.lirr / entry.count,
      avgMetroNorth: entry.sum.metroNorth / entry.count,
      avgAccessARide: entry.sum.accessARide / entry.count,
      avgBridgesTunnels: entry.sum.bridgesTunnels / entry.count,
      avgSir: entry.sum.sir / entry.count,
      avgTotal: entry.sum.total / entry.count,
    }
  })
}

// Process KPI data
function processKPIData(daily: DailyRidership[], recovery: RecoveryData[]): KPIData {
  if (daily.length === 0) {
    throw new Error('No daily data available')
  }

  const latest = daily[daily.length - 1]
  const week7Ago = daily[daily.length - 8] || daily[0]
  const days30Ago = daily[daily.length - 31] || daily[0]
  const latestRecovery = recovery[recovery.length - 1]

  const change7d = ((latest.total - week7Ago.total) / week7Ago.total) * 100
  const change30d = ((latest.total - days30Ago.total) / days30Ago.total) * 100

  // Weighted average recovery (by ridership volume)
  const totalRidership =
    latest.subway +
    latest.bus +
    latest.lirr +
    latest.metroNorth +
    latest.accessARide +
    latest.bridgesTunnels +
    latest.sir
  const weightedRecovery =
    ((latest.subway * latestRecovery.subwayPct +
      latest.bus * latestRecovery.busPct +
      latest.lirr * latestRecovery.lirrPct +
      latest.metroNorth * latestRecovery.metroNorthPct +
      latest.accessARide * latestRecovery.accessARidePct +
      latest.bridgesTunnels * latestRecovery.bridgesTunnelsPct +
      latest.sir * latestRecovery.sirPct) /
      totalRidership) *
    100

  return {
    totalRidership: latest.total,
    change7d,
    change30d,
    recoveryPct: weightedRecovery,
    byMode: {
      subway: {
        ridership: latest.subway,
        change: ((latest.subway - week7Ago.subway) / week7Ago.subway) * 100,
        recoveryPct: latestRecovery.subwayPct * 100,
      },
      bus: {
        ridership: latest.bus,
        change: ((latest.bus - week7Ago.bus) / week7Ago.bus) * 100,
        recoveryPct: latestRecovery.busPct * 100,
      },
      lirr: {
        ridership: latest.lirr,
        change: ((latest.lirr - week7Ago.lirr) / week7Ago.lirr) * 100,
        recoveryPct: latestRecovery.lirrPct * 100,
      },
      metroNorth: {
        ridership: latest.metroNorth,
        change: ((latest.metroNorth - week7Ago.metroNorth) / week7Ago.metroNorth) * 100,
        recoveryPct: latestRecovery.metroNorthPct * 100,
      },
      accessARide: {
        ridership: latest.accessARide,
        change: ((latest.accessARide - week7Ago.accessARide) / week7Ago.accessARide) * 100,
        recoveryPct: latestRecovery.accessARidePct * 100,
      },
      bridgesTunnels: {
        ridership: latest.bridgesTunnels,
        change:
          ((latest.bridgesTunnels - week7Ago.bridgesTunnels) / week7Ago.bridgesTunnels) * 100,
        recoveryPct: latestRecovery.bridgesTunnelsPct * 100,
      },
      sir: {
        ridership: latest.sir,
        change: ((latest.sir - week7Ago.sir) / week7Ago.sir) * 100,
        recoveryPct: latestRecovery.sirPct * 100,
      },
    },
  }
}

// Process congestion pricing impact data
function processCongestionPricingData(daily: DailyRidership[]): CongestionPricingData[] {
  const results: CongestionPricingData[] = []

  const processEvent = (
    event: 'launch' | 'pause' | 'resumption',
    eventDate: string
  ): CongestionPricingData | null => {
    const eventDateObj = parse(eventDate, 'yyyy-MM-dd', new Date())
    const before30Start = format(subDays(eventDateObj, 30), 'yyyy-MM-dd')
    const before30End = format(subDays(eventDateObj, 1), 'yyyy-MM-dd')
    const after30Start = eventDate
    const after30End = format(addDays(eventDateObj, 29), 'yyyy-MM-dd')

    const beforeData = daily.filter(
      (d) => d.date >= before30Start && d.date <= before30End
    )
    const afterData = daily.filter(
      (d) => d.date >= after30Start && d.date <= after30End
    )

    if (beforeData.length === 0 || afterData.length === 0) {
      return null
    }

    const avgBefore = {
      subway: beforeData.reduce((sum, d) => sum + d.subway, 0) / beforeData.length,
      bridgesTunnels:
        beforeData.reduce((sum, d) => sum + d.bridgesTunnels, 0) / beforeData.length,
      total: beforeData.reduce((sum, d) => sum + d.total, 0) / beforeData.length,
    }

    const avgAfter = {
      subway: afterData.reduce((sum, d) => sum + d.subway, 0) / afterData.length,
      bridgesTunnels:
        afterData.reduce((sum, d) => sum + d.bridgesTunnels, 0) / afterData.length,
      total: afterData.reduce((sum, d) => sum + d.total, 0) / afterData.length,
    }

    return {
      event,
      date: eventDate,
      before30d: {
        avgSubway: avgBefore.subway,
        avgBridgesTunnels: avgBefore.bridgesTunnels,
        avgTotal: avgBefore.total,
      },
      after30d: {
        avgSubway: avgAfter.subway,
        avgBridgesTunnels: avgAfter.bridgesTunnels,
        avgTotal: avgAfter.total,
      },
      subwayDelta: ((avgAfter.subway - avgBefore.subway) / avgBefore.subway) * 100,
      bridgesDelta:
        ((avgAfter.bridgesTunnels - avgBefore.bridgesTunnels) / avgBefore.bridgesTunnels) * 100,
    }
  }

  const launch = processEvent('launch', CONGESTION_PRICING_EVENTS.launch)
  if (launch) results.push(launch)

  const pause = processEvent('pause', CONGESTION_PRICING_EVENTS.pause)
  if (pause) results.push(pause)

  const resumption = processEvent('resumption', CONGESTION_PRICING_EVENTS.resumption)
  if (resumption) results.push(resumption)

  return results
}

// Create curated station data
function createStationData(): StationData[] {
  // Top 50 busiest NYC subway stations with coordinates and lines
  // This is a curated list for v1; can be enhanced with real GTFS data in v2
  return [
    {
      id: 'times-sq-42',
      name: 'Times Square-42 St',
      lat: 40.7580,
      lng: -73.9855,
      lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
      borough: 'Manhattan',
      avgDailyRidership: 175000,
      recoveryPct: 83,
    },
    {
      id: 'grand-central-42',
      name: 'Grand Central-42 St',
      lat: 40.7527,
      lng: -73.9772,
      lines: ['4', '5', '6', '7', 'S'],
      borough: 'Manhattan',
      avgDailyRidership: 165000,
      recoveryPct: 85,
    },
    {
      id: 'herald-sq-34',
      name: 'Herald Square-34 St',
      lat: 40.7506,
      lng: -73.9885,
      lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'],
      borough: 'Manhattan',
      avgDailyRidership: 125000,
      recoveryPct: 80,
    },
    {
      id: 'penn-station-34',
      name: 'Penn Station-34 St',
      lat: 40.7505,
      lng: -73.9934,
      lines: ['1', '2', '3', 'A', 'C', 'E'],
      borough: 'Manhattan',
      avgDailyRidership: 120000,
      recoveryPct: 82,
    },
    {
      id: '14-st-union-sq',
      name: '14 St-Union Square',
      lat: 40.7347,
      lng: -73.9897,
      lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
      borough: 'Manhattan',
      avgDailyRidership: 105000,
      recoveryPct: 78,
    },
    {
      id: 'fulton-st',
      name: 'Fulton Street',
      lat: 40.7097,
      lng: -74.0097,
      lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'],
      borough: 'Manhattan',
      avgDailyRidership: 95000,
      recoveryPct: 88,
    },
    {
      id: '59-st-columbus',
      name: '59 St-Columbus Circle',
      lat: 40.7683,
      lng: -73.9819,
      lines: ['1', '2', 'A', 'B', 'C', 'D'],
      borough: 'Manhattan',
      avgDailyRidership: 90000,
      recoveryPct: 81,
    },
    {
      id: 'atlantic-av-barclays',
      name: 'Atlantic Av-Barclays Center',
      lat: 40.6843,
      lng: -73.9774,
      lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'],
      borough: 'Brooklyn',
      avgDailyRidership: 88000,
      recoveryPct: 84,
    },
    {
      id: '86-st-lexington',
      name: '86 St (Lexington Ave)',
      lat: 40.7794,
      lng: -73.9554,
      lines: ['4', '5', '6'],
      borough: 'Manhattan',
      avgDailyRidership: 75000,
      recoveryPct: 79,
    },
    {
      id: 'canal-st',
      name: 'Canal Street',
      lat: 40.7188,
      lng: -74.0062,
      lines: ['1', '2', 'A', 'C', 'E', 'J', 'N', 'Q', 'R', 'W', 'Z', '6'],
      borough: 'Manhattan',
      avgDailyRidership: 72000,
      recoveryPct: 86,
    },
    {
      id: 'jackson-hts-roosevelt',
      name: 'Jackson Heights-Roosevelt Av',
      lat: 40.7465,
      lng: -73.8917,
      lines: ['E', 'F', 'M', 'R', '7'],
      borough: 'Queens',
      avgDailyRidership: 70000,
      recoveryPct: 90,
    },
    {
      id: 'flushing-main',
      name: 'Flushing-Main Street',
      lat: 40.7596,
      lng: -73.8303,
      lines: ['7'],
      borough: 'Queens',
      avgDailyRidership: 68000,
      recoveryPct: 92,
    },
    {
      id: '96-st-broadway',
      name: '96 St (Broadway)',
      lat: 40.7937,
      lng: -73.9726,
      lines: ['1', '2', '3'],
      borough: 'Manhattan',
      avgDailyRidership: 65000,
      recoveryPct: 76,
    },
    {
      id: '125-st-lexington',
      name: '125 St (Lexington Ave)',
      lat: 40.8043,
      lng: -73.9387,
      lines: ['4', '5', '6'],
      borough: 'Manhattan',
      avgDailyRidership: 63000,
      recoveryPct: 85,
    },
    {
      id: 'jay-st-metrotech',
      name: 'Jay St-MetroTech',
      lat: 40.6922,
      lng: -73.9862,
      lines: ['A', 'C', 'F', 'R'],
      borough: 'Brooklyn',
      avgDailyRidership: 60000,
      recoveryPct: 82,
    },
  ]
}

// Main processing function
async function main() {
  console.log('Starting MTA data processing...')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'raw-data', 'mta-daily-ridership.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  console.log('Parsing CSV...')
  const parseResult = Papa.parse<MTARawRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors)
    throw new Error('Failed to parse CSV')
  }

  const rows = parseResult.data
  console.log(`Parsed ${rows.length} rows`)

  // Process all data types
  console.log('Processing daily ridership...')
  const daily = processDailyData(rows)

  console.log('Processing recovery data...')
  const recovery = processRecoveryData(rows)

  console.log('Processing weekly aggregation...')
  const weekly = processWeeklyData(daily)

  console.log('Processing monthly aggregation...')
  const monthly = processMonthlyData(daily)

  console.log('Processing day-of-week averages...')
  const dow = processDayOfWeekData(daily)

  console.log('Processing KPI data...')
  const kpi = processKPIData(daily, recovery)

  console.log('Processing congestion pricing data...')
  const congestionPricing = processCongestionPricingData(daily)

  console.log('Creating station data...')
  const stations = createStationData()

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Write all output files
  console.log('Writing output files...')
  fs.writeFileSync(path.join(dataDir, 'daily.json'), JSON.stringify(daily, null, 2))
  fs.writeFileSync(path.join(dataDir, 'weekly.json'), JSON.stringify(weekly, null, 2))
  fs.writeFileSync(path.join(dataDir, 'monthly.json'), JSON.stringify(monthly, null, 2))
  fs.writeFileSync(path.join(dataDir, 'dow.json'), JSON.stringify(dow, null, 2))
  fs.writeFileSync(path.join(dataDir, 'recovery.json'), JSON.stringify(recovery, null, 2))
  fs.writeFileSync(path.join(dataDir, 'kpi.json'), JSON.stringify(kpi, null, 2))
  fs.writeFileSync(
    path.join(dataDir, 'congestion-pricing.json'),
    JSON.stringify(congestionPricing, null, 2)
  )
  fs.writeFileSync(path.join(dataDir, 'stations.json'), JSON.stringify(stations, null, 2))

  console.log('\nProcessing complete!')
  console.log(`Daily records: ${daily.length}`)
  console.log(`Weekly records: ${weekly.length}`)
  console.log(`Monthly records: ${monthly.length}`)
  console.log(`Day-of-week records: ${dow.length}`)
  console.log(`Recovery records: ${recovery.length}`)
  console.log(`Congestion pricing events: ${congestionPricing.length}`)
  console.log(`Stations: ${stations.length}`)
  console.log(`\nTotal ridership (latest): ${kpi.totalRidership.toLocaleString()}`)
  console.log(`Recovery percentage: ${kpi.recoveryPct.toFixed(1)}%`)
}

main().catch(console.error)
