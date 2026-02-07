# NYC Transit Pulse

A modern, dark-themed dashboard visualizing NYC MTA ridership data across all 7 transit modes, showing pandemic recovery trends, congestion pricing impact, and commute pattern shifts.

## Overview

NYC Transit Pulse is a single-page, static Next.js application that transforms MTA's daily ridership data into interactive visualizations. Built with React 18, TypeScript, Tailwind CSS, Recharts, and Leaflet, it showcases:

- **KPI Overview**: Total daily ridership, recovery percentage, mode-by-mode breakdown
- **Time-Series Trends**: Interactive charts with date range and mode filtering
- **Interactive Station Map**: Leaflet map of subway stations colored by ridership intensity
- **Pandemic Recovery Analysis**: Current vs. pre-pandemic comparison with event markers
- **Congestion Pricing Impact**: Before/after analysis around Jan 2024 launch, pause, and Feb 2025 resumption
- **Day-of-Week Patterns**: Remote work's impact on commute patterns (Tue-Thu peaks)
- **Mode Comparison**: Stacked area showing ridership composition over time

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.2.35 |
| React | React | 18.3.1 (pinned) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.1 |
| Charts | Recharts | 2.15.0 |
| Maps | Leaflet + react-leaflet | 1.9.4 + 4.2.1 |
| Date Handling | date-fns | 4.1.0 |
| CSV Parsing | papaparse | 5.4.1 |
| Theme | next-themes | 0.4.4 |
| Testing | Vitest + Testing Library | 2.1.8 + 16.1.0 |

## Project Structure

```
nyc-transit-pulse/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Theme tokens and base styles
├── components/             # React components (to be built in Thread 2-6)
│   ├── layout/             # Header, footer, shell
│   ├── filters/            # Date range, mode toggles
│   ├── kpi/                # KPI cards
│   ├── charts/             # Recharts components
│   ├── map/                # Leaflet map components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and helpers
│   ├── colors.ts           # MTA mode colors, subway line colors
│   ├── constants.ts        # Event markers, date presets
│   └── format.ts           # Number/date formatting utilities
├── types/                  # TypeScript type definitions
│   └── transit.ts          # All data shape interfaces
├── scripts/                # Build-time data processing
│   └── process-data.ts     # MTA CSV → JSON transformation
├── data/                   # Processed JSON (COMMITTED to git)
│   ├── daily.json          # Daily ridership (1776 records)
│   ├── weekly.json         # Weekly aggregation
│   ├── monthly.json        # Monthly aggregation
│   ├── dow.json            # Day-of-week averages
│   ├── recovery.json       # Recovery percentages
│   ├── kpi.json            # Pre-computed KPIs
│   ├── congestion-pricing.json  # CP impact data
│   └── stations.json       # Station coordinates + ridership
├── raw-data/               # MTA source CSV (gitignored)
└── __tests__/              # Vitest unit tests
```

## Data Source

**MTA Daily Ridership Data (2020-2025)**
- Source: [data.ny.gov](https://data.ny.gov/Transportation/MTA-Daily-Ridership-Data-2020-2025/vxuj-8kew)
- Format: CSV (direct download, no API key needed)
- Coverage: March 2020 - present (1776+ daily records)
- Modes: Subway, Bus, LIRR, Metro-North, Access-A-Ride, Bridges & Tunnels, Staten Island Railway

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nyc-transit-pulse

# Install dependencies
npm install

# Verify React 18 is installed (NOT React 19)
npm ls react react-dom
# Should show react@18.3.1 and react-dom@18.3.1
```

### Data Processing

The MTA CSV has already been downloaded and processed. To refresh the data:

```bash
# Download fresh MTA data
curl -L "https://data.ny.gov/api/views/vxuj-8kew/rows.csv?accessType=DOWNLOAD" \
  -o raw-data/mta-daily-ridership.csv

# Process the CSV into optimized JSON files
npm run process-data

# This generates 8 JSON files in data/:
# - daily.json (375KB)
# - weekly.json (64KB)
# - monthly.json (13KB)
# - dow.json (2.3KB)
# - recovery.json (352KB)
# - kpi.json (933B)
# - congestion-pricing.json (830B)
# - stations.json (4.1KB)
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Current test coverage:
# - 15 data processing tests
# - 17 formatting utility tests
# - All 32 tests passing
```

### Build

```bash
# Build for production (static export)
npm run build

# Verify TypeScript compilation
npx tsc --noEmit

# The build creates a static site in out/
# Ready to deploy to Vercel, Netlify, or any static host
```

## Key Design Decisions

### React 18 Pinned (NOT React 19)

React 18 is explicitly pinned in `package.json`:
```json
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

**Why?** Next.js 14 stable is not yet fully compatible with React 19. The London Transit Pulse build failed due to React 19 being auto-installed. This project pins React 18 to prevent the same issue.

### Data Directory is Committed

The `data/` directory is **NOT** in `.gitignore`. All processed JSON files are committed to the repository.

**Why?** Vercel builds need access to the data files. If `data/` were gitignored, the deployed site would have no data. The London build initially gitignored data, causing the deployed site to break.

### Static Export (No Server)

Next.js is configured with `output: 'export'` in `next.config.js`.

**Why?** The dashboard is fully static—no server-side rendering, no API routes, no database. All data is pre-processed at build time. This enables free hosting on Vercel/Netlify and excellent performance.

### Test-Driven Data Processing

The data pipeline includes comprehensive unit tests that verify:
- CSV parsing correctness
- Aggregation accuracy (weekly, monthly, day-of-week)
- Recovery percentage calculations
- KPI computations
- Congestion pricing before/after logic
- File size constraints (< 2MB total)

**Why?** Data correctness is critical. Tests catch bugs early and serve as executable documentation of the processing logic.

## Current Status

**Thread 1 Complete:**
- ✅ Next.js 14 + React 18 project initialized
- ✅ All dependencies installed
- ✅ MTA data downloaded (1776 records)
- ✅ Data processing pipeline implemented and tested
- ✅ TypeScript types defined for all data shapes
- ✅ MTA mode colors and constants defined
- ✅ 32 unit tests passing
- ✅ `npm run build` succeeds
- ✅ TypeScript compiles cleanly
- ✅ Git repo initialized with clean commit
- ✅ Data files committed (not gitignored)

**Next Steps (Thread 2):**
- Build dashboard shell (header, layout, theme toggle)
- Implement dark/light theme system with MTA colors
- Create KPI card components wired to filter context
- Set up responsive layout grid

## Data Summary

- **Daily records**: 1,776 (Jan 2021 - Dec 2024)
- **Weekly records**: 255
- **Monthly records**: 59
- **Stations**: 15 (curated top stations with coordinates)
- **Latest total ridership**: 5.87M daily riders
- **Overall recovery**: 72.8% of pre-pandemic levels
- **Congestion pricing events**: 2 (launch + pause; resumption pending data)

## Companion Project

This project is part of a multi-city transit dashboard series:
- **London Transit Pulse** ([link](https://github.com/clairedonald/transit-dashboard)) - TfL data visualization
- **NYC Transit Pulse** (this project) - MTA data visualization

## License

MIT

## Attribution

Data: [MTA Open Data](https://data.ny.gov) via data.ny.gov
Built with Next.js, Recharts, and Leaflet
Designed and developed by Claire Donald
