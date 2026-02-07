# PRD: NYC Transit Pulse

> **Status:** Draft
> **Created:** 2026-02-07
> **Last Updated:** 2026-02-07

---

## 1. Problem Statement

### The Pain Point

New York City's MTA is the largest public transit system in North America -- 7 modes, 472 stations, billions of annual rides. The MTA publishes detailed daily ridership data in a single centralized CSV covering 2020-2025, including pre-pandemic comparison percentages. But the tools to explore this data are uniformly poor. The MTA's own dashboard (metrics.mta.info) is a Streamlit app -- functional but visually unremarkable. Community-built dashboards on GitHub are data-rich but design-poor (Dash, Streamlit, Jupyter notebooks). No one has built a modern, design-forward, mobile-responsive visualization that makes the NYC transit recovery story explorable and compelling.

### Why It Matters

The MTA carried over 5.5 million daily subway riders in 2019. By April 2020 that number had collapsed to under 500,000. Five years later, the system has clawed back to roughly 85% -- but the story is far more nuanced than a single number. Subway is recovering faster than buses. Paratransit (Access-A-Ride) has surged to 161% of pre-pandemic levels. Congestion pricing launched in January 2024, was paused, and resumed in February 2025, creating a natural experiment visible in the data. Remote work has reshaped weekday commute patterns: Tuesday-Thursday peaks are smaller, weekends are relatively stronger. These stories are all encoded in publicly available data. They deserve a visualization that does them justice.

### Current State

- **MTA's metrics.mta.info:** Streamlit app with basic line charts. Functional but aesthetically poor, not mobile-responsive, limited interactivity.
- **GitHub community dashboards:** Multiple Streamlit/Dash/Plotly projects. Data-heavy, design-light. None are mobile-responsive or visually polished.
- **No geographic component:** Existing dashboards show time-series only. No one combines ridership data with a station map.
- **Congestion pricing analysis:** Mostly in static blog posts and news articles. No interactive tool lets users explore the before/after impact themselves.
- **Common gaps across all:** No dark theme, no mobile responsiveness, no animation, no geographic visualization, no event markers for narrative context.

### Existing Code References

This is a greenfield project. However, the companion project **London Transit Pulse** (`~/transit-dashboard/`) serves as the architectural reference and design precedent. This PRD incorporates lessons learned from the London build.

---

## 2. Solution Overview

### Core Idea

Build **NYC Transit Pulse** -- a modern, dark-themed, mobile-responsive dashboard that visualizes MTA ridership data across all 7 modes (Subway, Bus, LIRR, Metro-North, Access-A-Ride, Bridges & Tunnels, Staten Island Railway). The dashboard combines time-series trend charts, an interactive subway station map with ridership intensity, pandemic recovery analytics, congestion pricing impact analysis, and day-of-week pattern exploration. Data is pre-processed from the MTA's centralized daily ridership CSV at build time -- no backend, no database, no runtime API keys. NYC-specific narratives (congestion pricing, paratransit surge, remote work patterns) are woven into the visualization through event markers, annotations, and comparative views.

### Success Looks Like

1. A visitor lands on the dashboard and immediately grasps the scale of NYC transit through prominent KPI cards (daily ridership, recovery percentage, mode breakdown).
2. They can explore ridership trends over time using interactive charts with date range and mode filters.
3. They can view a map of subway stations colored by ridership intensity and click a station for details.
4. They can see the congestion pricing impact: before/after comparison with event markers for the January 2024 launch, pause, and February 2025 resumption.
5. They can compare recovery trajectories across modes and discover that paratransit has surpassed pre-pandemic levels while subway lags.
6. All global filters (date range, mode selection) affect ALL components including KPI cards, charts, and map -- not just visual dimming but actual data recalculation.
7. The dashboard loads fast, looks professional on both desktop and mobile, and uses a dark theme with vibrant accent colors inspired by the MTA's design language.
8. Someone seeing it says "this is really well done" rather than "another Streamlit dashboard."

---

## 3. Users

### Primary User

The creator (Claire). This is a personal portfolio/showcase project demonstrating data visualization, frontend engineering, and design sensibility. It is the second entry in a multi-city transit dashboard series (after London Transit Pulse).

### Secondary Users

Anyone interested in NYC transit data: transit enthusiasts, urbanists, data viz practitioners, journalists covering congestion pricing, recruiters viewing portfolio work.

### Multi-User Consideration

Not applicable. No auth, no user accounts. This is a read-only public dashboard. All visitors see the same data.

---

## 4. MVP Scope

### In Scope (v1)

- [x] **KPI Overview Panel** -- Total daily ridership (latest period), percent change vs. prior period, percent of pre-pandemic baseline recovered, breakdown by mode (Subway, Bus, LIRR, Metro-North, Access-A-Ride, Bridges & Tunnels, Staten Island Railway)
- [x] **Time-Series Trend Charts** -- Daily/weekly/monthly ridership by mode with smooth line charts, toggleable modes, and zoomable date range
- [x] **Date Range Selector** -- Global filter controlling ALL charts and KPI cards (preset ranges: 7d, 30d, 90d, YTD, 1Y, All + custom date picker)
- [x] **Mode Filter** -- Toggle individual transit modes on/off across ALL visualizations; toggling a mode recalculates data values, not just visual opacity
- [x] **Interactive Subway Station Map** -- Leaflet map with CartoDB Dark Matter tiles showing subway stations as circles sized/colored by ridership volume; clickable for station detail popover; station coordinates from MTA GTFS static feed
- [x] **Pandemic Recovery Comparison** -- Chart overlaying current ridership against pre-pandemic baseline, showing recovery percentage over time per mode
- [x] **Congestion Pricing Impact** -- Event markers for congestion pricing launch (Jan 2024), pause, and resumption (Feb 2025); before/after comparison view
- [x] **Day-of-Week Pattern Analysis** -- Grouped bar chart showing ridership patterns across days of the week (weekday vs. weekend, remote work shifts)
- [x] **Mode Comparison View** -- Stacked area chart showing composition of total ridership by mode over time; highlights paratransit surge
- [x] **Dark Theme** -- Default dark theme with vibrant accent colors matching MTA design language (subway line colors, mode colors); optional light theme toggle
- [x] **Mobile-Responsive Layout** -- Dashboard adapts gracefully from desktop (multi-column) to mobile (stacked cards)
- [x] **Data Processing Pipeline** -- Build-time script that downloads and processes MTA daily ridership CSV into optimized JSON for the frontend
- [x] **Static Deployment** -- Deployed to Vercel as a static Next.js site

### Out of Scope (v1)

- Real-time MTA service alerts or arrival predictions (requires live API, WebSocket complexity)
- Origin-destination flow diagrams (available for v2 from MTA O-D data)
- User accounts or authentication
- Predictive forecasting / ML models
- Multi-city comparison view (London + NYC side-by-side -- v2)
- Server-side data refresh (data is baked at build time for v1)
- Full WCAG accessibility audit beyond basic ARIA labels (v2)
- Embedding / iframing support
- Data export (CSV/PDF download)
- Per-line subway ridership (e.g., A/C/E vs. 1/2/3) -- only total subway mode for v1
- Fare revenue analysis

### Scope Boundary

The MVP is a **read-only, static-data dashboard** focused on historical MTA ridership from the centralized daily CSV (2020-2025). It does not fetch live data, require any backend services, or need any runtime API keys. The data processing pipeline runs at build time and produces static JSON files that Next.js serves directly. Leaflet tiles (CartoDB/OpenStreetMap) are free and require no API key. The MTA data CSV requires no API key for bulk download.

---

## 5. Sequential Thread Plan

> **London Build Lessons Incorporated:**
> 1. React 18 is explicitly pinned (no React 19/Next.js 14 mismatch)
> 2. `data/` directory is NOT gitignored -- committed to repo
> 3. Thread 7 includes `next build` verification before first deploy
> 4. All components consume shared filter state (architecture enforced from Thread 3)
> 5. Every feature thread includes integration tests for filter-to-component data flow
> 6. Mode toggles affect data values, not just visual state (specified in filter architecture)

### Thread 1: Project Scaffolding & Data Pipeline

**Purpose:** Set up the Next.js project with all dependencies and build the data processing pipeline that converts MTA daily ridership CSV into optimized JSON files for the frontend.

**Actions:**
- [ ] Initialize Next.js 14 project with TypeScript, Tailwind CSS, and App Router
- [ ] **Pin React 18 explicitly** in `package.json` (`"react": "^18.2.0"`, `"react-dom": "^18.2.0"`) -- do NOT use React 19 (incompatible with Next.js 14 stable)
- [ ] Install dependencies: recharts, leaflet, react-leaflet, @types/leaflet, shadcn/ui, lucide-react, date-fns, papaparse, @types/papaparse
- [ ] Configure Tailwind with dark theme as default (CSS custom properties for theme tokens)
- [ ] Set up project structure: `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `scripts/`, `data/`
- [ ] **Ensure `data/` directory is NOT in `.gitignore`** -- data files must be committed to the repository for Vercel builds
- [ ] Download MTA Daily Ridership Data CSV from https://data.ny.gov/Transportation/MTA-Daily-Ridership-Data-2020-2025/vxuj-8kew (direct CSV export, no API key needed)
- [ ] Write `scripts/process-data.ts` that:
  - Parses the MTA CSV (columns: Date, Subways: Total Estimated Ridership, Subways: % of Comparable Pre-Pandemic Day, Buses: Total Estimated Ridership, Buses: % of Comparable Pre-Pandemic Day, LIRR: Total Estimated Ridership, LIRR: % of Comparable Pre-Pandemic Day, Metro-North: Total Estimated Ridership, Metro-North: % of Comparable Pre-Pandemic Day, Access-A-Ride: Total Scheduled Trips, Access-A-Ride: % of Comparable Pre-Pandemic Day, Bridges and Tunnels: Total Traffic, Bridges and Tunnels: % of Comparable Pre-Pandemic Day, Staten Island Railway: Total Estimated Ridership, Staten Island Railway: % of Comparable Pre-Pandemic Day)
  - Aggregates by day, week, month, and mode
  - Computes 7-day rolling averages
  - Computes day-of-week aggregates
  - Computes recovery percentages from the pre-pandemic % columns (already in the CSV)
  - Computes congestion pricing before/after aggregates (defined periods around Jan 2024, Feb 2025)
  - Outputs `data/daily.json`, `data/weekly.json`, `data/monthly.json`, `data/dow.json`, `data/recovery.json`, `data/kpi.json`, `data/stations.json`, `data/congestion-pricing.json`
- [ ] Add `npm run process-data` script to package.json
- [ ] Write TypeScript types for all data shapes in `src/types/transit.ts`
- [ ] Write tests for data processing logic (aggregation, rolling average, date parsing, recovery % extraction)
- [ ] Verify processed JSON files are valid and reasonable (spot-check totals against MTA published numbers)
- [ ] For station coordinate data: download MTA GTFS static feed for subway station lat/lng coordinates
- [ ] Run `next build` to verify the project compiles cleanly before proceeding

**Validation Targets:**
- [ ] `npm run dev` starts without errors
- [ ] `npm run process-data` produces all JSON files
- [ ] `npm run build` succeeds (Next.js static build)
- [ ] `tsc --noEmit` passes with no TypeScript errors
- [ ] Data processing tests pass
- [ ] JSON files are reasonable size (< 5MB total for frontend bundle)
- [ ] `data/` directory is tracked by git (not in `.gitignore`)
- [ ] `package.json` shows `react` and `react-dom` at version `^18.x`

**Deliverables:**
- Working Next.js 14 + React 18 project with all dependencies
- Data processing pipeline with tests
- Processed JSON data files committed to repo
- TypeScript type definitions for all data shapes

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Cross-file work involving CSV parsing, data aggregation, and TypeScript type design. The MTA CSV is well-structured (single file, all modes) which simplifies processing compared to London's fragmented data. However, the congestion pricing date-window logic and 7-mode handling add moderate complexity.

**Dependencies:** None
**Parallelizable:** No -- foundation thread that all others depend on

---

### Thread 2: Layout Shell, Theme System & KPI Cards

**Purpose:** Build the application shell (header, sidebar/nav, main content area), implement the dark/light theme system, and create the KPI overview cards that form the dashboard's top section. KPI cards must consume shared filter state for data recalculation.

**Actions:**
- [ ] Create root layout with dark theme as default using CSS custom properties and `next-themes`
- [ ] Build `<DashboardShell>` component: header with logo/title, responsive sidebar/nav, main content grid
- [ ] Define color palette inspired by MTA design language:
  - Dark background: `#0a0a0f` / `#111118`
  - Card surfaces: `#1a1a2e`
  - Mode accent colors: Subway Blue `#0039A6`, Bus Orange `#FF6319`, LIRR Yellow/Gold `#FCCC0A`, Metro-North Blue-Green `#00A65C`, Access-A-Ride Purple `#B933AD`, Bridges & Tunnels Gray `#6D6E71`, SIR Blue `#0039A6` (lighter variant)
- [ ] Build `<KPICard>` component: large number, label, delta indicator (up/down arrow with color), sparkline mini-chart
- [ ] Build `<KPISection>` that displays 4-7 KPI cards in a responsive grid (3-4 columns desktop, 2 tablet, 1 mobile)
- [ ] **Wire KPI cards to shared filter context** -- when mode filters or date range change, KPI values must recalculate (not just dim visually)
- [ ] Implement theme toggle (sun/moon icon in header)
- [ ] Add responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- [ ] Write unit tests for KPICard rendering, theme toggle, and responsive layout logic
- [ ] **Write integration test:** verify that changing the date range in filter context causes KPI card values to update

**Validation Targets:**
- [ ] Dashboard shell renders with dark theme by default
- [ ] KPI cards display real data from processed JSON
- [ ] Theme toggle switches between dark and light
- [ ] Layout is responsive across breakpoints
- [ ] KPI values change when filter context changes (not just visual dimming)
- [ ] Unit and integration tests pass
- [ ] `npm run build` succeeds

**Deliverables:**
- Dashboard shell component
- Theme system with dark/light toggle
- KPI card components with real data wired to filter context
- Responsive layout foundation
- Integration test for filter-to-KPI data flow

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Multiple components with cross-cutting theme concerns. Responsive layout requires careful CSS work. Design tokens need to be established here for all subsequent threads. The key lesson from London: KPI cards must actually consume filter state, not just dim.

**Dependencies:** Thread 1
**Parallelizable:** No -- establishes the shell and design system that Threads 3-6 build into

---

### Thread 3: Time-Series Charts & Global Filter Architecture

**Purpose:** Build the primary ridership trend charts with interactive date range selection and mode filtering that control all visualizations. Establish the global filter architecture that ALL subsequent components must consume.

**Actions:**
- [ ] Create `<GlobalFilters>` component with:
  - Date range presets (7d, 30d, 90d, YTD, 1Y, All) as pill buttons
  - Custom date range picker using shadcn/ui `<DatePickerWithRange>`
  - Mode toggle chips (Subway, Bus, LIRR, Metro-North, Access-A-Ride, Bridges & Tunnels, SIR) with mode-specific MTA colors
- [ ] Create the filter context/store (`src/lib/filter-context.tsx`):
  - `dateRange: { start: Date, end: Date, preset: string }`
  - `activeModes: Set<TransitMode>` -- **toggling modes must recalculate data values in all consuming components, not just toggle CSS opacity**
  - `rollingAverage: boolean`
  - All consuming components use `useFilteredData()` hooks that memoize filtered results
- [ ] Build `<RidershipTrendChart>` using Recharts:
  - Multi-line chart with one line per active mode
  - Smooth curves (monotone interpolation)
  - Tooltips showing date, ridership by mode, total
  - Y-axis formatted with compact notation (e.g., "2.5M")
  - Responsive container
  - 7-day rolling average toggle
- [ ] Build `<ModeComparisonChart>` -- stacked area chart showing composition of total ridership by mode over time; paratransit surge visible as growing slice
- [ ] Style charts for dark theme: dark grid lines, light text, vibrant colored lines matching MTA mode palette
- [ ] Write unit tests for filter context state management, date range computation, and chart data transformation
- [ ] **Write integration tests:**
  - Changing date range filter updates trend chart data bounds
  - Toggling a mode off removes that mode's data from calculations (not just hides the line visually)
  - Mode comparison chart totals change when modes are toggled

**Validation Targets:**
- [ ] Trend chart renders with real data for all 7 modes
- [ ] Date range presets filter data correctly
- [ ] Mode toggles show/hide lines AND recalculate totals
- [ ] Custom date range works
- [ ] Charts are responsive on mobile
- [ ] Unit and integration tests pass
- [ ] `npm run build` succeeds

**Deliverables:**
- Global filter context with documented architecture (other threads reference this)
- Filter components (date range, mode toggles)
- Ridership trend chart
- Mode comparison chart
- Chart dark theme styling
- Integration tests for filter-to-chart data flow

**Reasoning Level:** Medium (Sonnet)

**Rationale:** This is the architectural keystone thread. The filter context established here must be consumed by every subsequent component. The London build failed because KPIs and mode toggles were not properly wired to filter state. This thread must get the architecture right.

**Dependencies:** Thread 1, Thread 2
**Parallelizable:** Yes -- can run alongside Thread 4 (both depend on Thread 2 but don't share components)

---

### Thread 4: Interactive Subway Station Map

**Purpose:** Build the Leaflet-based interactive map showing NYC subway stations colored and sized by ridership intensity, with click-to-view station detail popovers. Map must consume shared filter state.

**Actions:**
- [ ] Install and configure `react-leaflet` with dynamic import (`next/dynamic` with `ssr: false`) to avoid SSR issues
- [ ] Create `<StationMap>` component:
  - Leaflet map centered on Manhattan (40.7580, -73.9855) with zoom level 11-12
  - CartoDB Dark Matter tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
  - Circle markers for each subway station, sized by ridership volume (min 4px, max 20px radius)
  - Color gradient from cool (low ridership) to warm (high ridership) using a perceptually uniform scale
- [ ] Create `<StationPopover>` component showing on click:
  - Station name
  - Subway lines served (with line color bullets: A/C/E blue, 1/2/3 red, etc.)
  - Borough
  - Average daily ridership (for selected date range)
  - Comparison to pre-pandemic baseline (recovery %)
  - Sparkline showing 30-day trend
- [ ] **Connect map to global filter context** -- date range affects station ridership aggregation; mode filter (subway on/off) controls whether map data displays
- [ ] Add map legend showing ridership intensity scale
- [ ] Handle mobile: map takes full width, touch-friendly markers, popover as bottom sheet on mobile
- [ ] Station data from MTA GTFS static feed for coordinates; ridership estimates from MTA subway hourly ridership dataset or curated from published rankings
- [ ] Write unit tests for station data loading, marker size/color computation, and popover content
- [ ] **Write integration test:** changing the date range in filters causes station ridership values to update in the map layer

**Validation Targets:**
- [ ] Map renders with dark tiles centered on Manhattan/NYC
- [ ] Station markers appear sized by ridership
- [ ] Clicking a marker shows station details with line color bullets
- [ ] Map responds to global date range filter
- [ ] Map works on mobile with touch interactions
- [ ] Unit and integration tests pass
- [ ] `npm run build` succeeds

**Deliverables:**
- Interactive Leaflet map component
- Station popover component with MTA line colors
- Map legend
- Station coordinate data (from GTFS)
- Integration test for filter-to-map data flow

**Reasoning Level:** Medium-High (Sonnet)

**Rationale:** Leaflet + Next.js SSR avoidance requires careful dynamic import handling. NYC has many more subway stations (~472 station complexes) than London Tube stations (~270), so marker rendering performance matters. MTA line color display in popovers adds visual complexity. Mobile touch interactions on maps need special attention.

**Dependencies:** Thread 1, Thread 2
**Parallelizable:** Yes -- can run alongside Thread 3 (both depend on Thread 2 but don't share components)

---

### Thread 5: Pandemic Recovery, Congestion Pricing & Day-of-Week Analysis

**Purpose:** Build the pandemic recovery comparison chart, congestion pricing impact visualization, and day-of-week ridership pattern analysis. These are the narrative heart of the dashboard -- the "NYC stories" section.

**Actions:**
- [ ] Build `<PandemicRecoveryChart>` using Recharts:
  - Dual-axis or overlay chart showing current ridership vs. pre-pandemic baseline
  - Shaded area between the two lines indicating the recovery gap
  - Recovery percentage annotation (e.g., "85% of pre-pandemic levels")
  - Key event markers on the timeline as vertical reference lines with labels
  - Mode selector to view recovery by individual mode or system-wide
  - **Highlight the paratransit anomaly:** Access-A-Ride at 161% of pre-pandemic should be visually distinct (above baseline, different color treatment)
- [ ] Build `<CongestionPricingChart>`:
  - Before/after comparison view centered on congestion pricing events
  - Event markers: "Congestion Pricing Launch" (Jan 5, 2024), "Pause" (Jun 2024), "Resumption" (Feb 2025, or actual date)
  - Side-by-side or overlay showing subway ridership in 30-day windows before vs. after each event
  - Annotations highlighting percentage changes
  - Bridges & Tunnels traffic comparison (expected to decrease as subway increases)
- [ ] Build `<DayOfWeekChart>`:
  - Grouped bar chart comparing weekday average vs. Saturday vs. Sunday by mode
  - Color intensity mapping using MTA mode palette
  - Tooltip showing exact values
  - Annotation: "Subway peaks Tuesday-Thursday; weekends recovering faster than weekdays -- the remote work signature"
- [ ] Add `<RecoveryKPIBars>` component showing recovery percentage for each mode as a compact row of progress bars
- [ ] Wire ALL charts to global filter context (date range affects comparison period, mode toggles affect data calculations)
- [ ] Style for dark theme consistency
- [ ] Write unit tests for recovery percentage computation, congestion pricing date-window logic, and day-of-week aggregation
- [ ] **Write integration tests:**
  - Toggling mode filter recalculates recovery percentages (not just visual dimming)
  - Changing date range updates congestion pricing comparison windows
  - Day-of-week chart responds to filter changes

**NYC Event Markers:**

| Date | Label |
|------|-------|
| 2020-03-22 | NY PAUSE (Lockdown) |
| 2020-06-08 | Phase 1 Reopening |
| 2021-02-01 | Indoor Dining Returns |
| 2021-06-15 | Full Reopening |
| 2022-01-03 | Omicron Peak |
| 2024-01-05 | Congestion Pricing Launch |
| 2024-06-XX | Congestion Pricing Paused |
| 2025-02-XX | Congestion Pricing Resumed |

**Validation Targets:**
- [ ] Recovery chart shows current vs. pre-pandemic with visible gap
- [ ] Access-A-Ride shows ABOVE pre-pandemic levels (161%) with distinct visual treatment
- [ ] Congestion pricing chart shows clear before/after comparison
- [ ] Day-of-week chart reveals remote work patterns (Tue-Thu peak)
- [ ] Event markers appear at correct dates
- [ ] ALL charts respond to global filters with data recalculation
- [ ] Unit and integration tests pass
- [ ] `npm run build` succeeds

**Deliverables:**
- Pandemic recovery chart with gap visualization and paratransit anomaly highlight
- Congestion pricing impact comparison chart
- Day-of-week pattern chart with remote work annotations
- Recovery KPI progress bars
- NYC-specific timeline event markers
- Integration tests for filter-to-analysis data flow

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Chart implementations follow patterns established in Thread 3. The congestion pricing comparison requires careful date-window logic but isn't architecturally novel. The paratransit anomaly (above 100%) needs a visual treatment that the London build didn't need. Recovery math is simplified because the MTA CSV includes pre-pandemic percentages directly.

**Dependencies:** Thread 2, Thread 3 (reuses chart patterns and filter context)
**Parallelizable:** Yes -- can run alongside Thread 4 or Thread 6

---

### Thread 6: Dashboard Composition, Animations & Polish

**Purpose:** Assemble all components into the final dashboard layout, add micro-animations, loading states, and visual polish to achieve a professional, portfolio-worthy result.

**Actions:**
- [ ] Compose the main dashboard page (`src/app/page.tsx`) with the final layout:
  - Top: KPI cards row (7 modes)
  - Below: Global filters bar (sticky on scroll)
  - Main area: Trend chart (full width), then 2-column grid (map left, recovery chart right), then congestion pricing chart (full width), then day-of-week chart (full width), then mode comparison (full width)
  - Footer with data source attribution and last updated timestamp
- [ ] Add scroll-triggered fade-in animations for chart sections using CSS `@keyframes` or lightweight approach
- [ ] Implement skeleton loading states for all chart components (pulsing dark rectangles matching chart dimensions)
- [ ] Add number count-up animation for KPI cards on initial load
- [ ] Fine-tune responsive layout:
  - Desktop: multi-column grid
  - Tablet: 2-column with map full-width
  - Mobile: single column, charts stack vertically, map gets dedicated section
- [ ] Add `<DataSourceFooter>` with MTA attribution, data freshness date, and GitHub link
- [ ] Add subtle background pattern or gradient to distinguish sections
- [ ] Cross-browser test: Chrome, Firefox, Safari
- [ ] Performance check: Lighthouse score > 85 for performance
- [ ] **Verify all components consume filter context:** every chart section, every KPI card, the map -- all must respond to filter changes with data recalculation
- [ ] Write integration tests: page renders all major sections, filter interaction updates multiple charts simultaneously

**Validation Targets:**
- [ ] Dashboard looks professional and polished
- [ ] Animations are smooth, not janky
- [ ] Loading states appear before data renders
- [ ] Layout works at all breakpoints (320px - 1920px)
- [ ] Lighthouse performance > 85
- [ ] ALL sections render with real data
- [ ] Filter changes propagate to ALL components (verified manually and via integration tests)
- [ ] Tests pass
- [ ] `npm run build` succeeds

**Deliverables:**
- Final composed dashboard page
- Animation system
- Loading skeleton components
- Responsive layout finalization
- Data source footer
- Integration tests for full-page filter propagation

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Composition and polish work. No new architectural patterns, but requires an eye for detail across many components. Animation and responsive tuning is iterative. The key difference from London: explicit verification that every component is wired to filter state.

**Dependencies:** Threads 2, 3, 4, 5
**Parallelizable:** No -- integration thread that combines all prior work

---

### Thread 7: Testing, Build Verification & Deployment

**Purpose:** Ensure comprehensive test coverage, verify the production build succeeds locally, write documentation, and deploy to Vercel.

**Actions:**
- [ ] Review and fill test coverage gaps:
  - Unit tests for all data transformation utilities
  - Component tests for KPI cards, charts (render with mock data), map (renders container)
  - Integration tests: full page render with all sections
  - Integration tests: filter context changes propagate to all chart components
  - Filter context: state transitions, date range computation
- [ ] **CRITICAL: Run `npm run build` (or `next build`) locally and verify it succeeds** before any deployment attempt. Fix all build errors. This is a hard gate from London lessons.
- [ ] Run `tsc --noEmit` to verify clean TypeScript compilation
- [ ] Run full test suite (`npm test`) and fix any failures
- [ ] Write `README.md`:
  - Project overview with screenshot
  - Tech stack
  - Local development setup
  - Data processing instructions
  - Deployment instructions
  - Data source attribution (MTA Daily Ridership Data)
  - Link to companion London Transit Pulse project
- [ ] Configure Vercel project:
  - Link GitHub repo
  - Set build command and output directory
  - **Verify `data/` directory is committed** (not gitignored) so Vercel build has access to data files
  - Verify deployment succeeds
- [ ] Verify deployed site loads correctly on Vercel URL
- [ ] Add OG image and meta tags for social sharing (NYC skyline or subway-themed)
- [ ] Verify all filters work on deployed site (date range changes, mode toggles, map interactions)

**Validation Targets:**
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles cleanly (`tsc --noEmit`)
- [ ] `npm run build` succeeds **locally** before deploy
- [ ] Vercel deployment is live and accessible
- [ ] README is complete and accurate
- [ ] OG tags render correct preview when sharing URL
- [ ] All filters work on the deployed site
- [ ] `data/` directory is present in git repo

**Deliverables:**
- Complete test suite (unit + integration)
- README.md
- Live Vercel deployment (verified working)
- Social sharing meta tags

**Reasoning Level:** Low (Sonnet)

**Rationale:** Follows established patterns. Testing is writing more of what already exists. Deployment is procedural but includes the critical lesson from London: verify the build locally first. Documentation is descriptive.

**Dependencies:** Thread 6
**Parallelizable:** No -- final thread that validates everything

---

### Thread Execution Guidance

1. **Execute ONE thread per conversation** -- don't combine threads
2. **Read all reference material first** -- understand context before coding
3. **Threads 3 and 4 can run in parallel** after Thread 2 completes
4. **Thread 5 can run alongside Thread 4** after Thread 3 completes (it needs the chart patterns and filter architecture)
5. **Thread 6 is the integration point** -- requires all feature threads done
6. **Thread 7 is the final gate** -- local build verification BEFORE deployment
7. **Every thread must run `npm run build`** at the end to catch build issues early

### Parallelization Map

```
Thread 1 (Foundation + Data Pipeline)
    |
Thread 2 (Shell + Theme + KPIs)
    |
    +-- Thread 3 (Charts + Filter Architecture) --+-- Thread 5 (Recovery + Congestion Pricing + DOW)
    |                                              |
    +-- Thread 4 (Station Map) -------------------+
                                                   |
                                              Thread 6 (Composition + Polish)
                                                   |
                                              Thread 7 (Test + Build Verify + Deploy)
```

### London Lessons Checklist (Verify in Every Thread)

| # | Lesson | Verification |
|---|--------|-------------|
| 1 | React 18 pinned | Check `package.json` -- must show `^18.x` |
| 2 | `data/` not gitignored | Check `.gitignore` -- `data/` must NOT appear |
| 3 | Local build before deploy | Thread 7 runs `next build` before Vercel push |
| 4 | All components consume filter state | Every component reads from `FilterContext` |
| 5 | Integration tests in every thread | Each thread writes filter-to-component tests |
| 6 | Mode toggles recalculate data | Toggling mode changes values, not just opacity |

### Completion Log Template

After each thread, record:
```
**Thread [N] Completion Log:**
- Status: Complete / Partial / Blocked
- Files Modified:
  - `path/file.ts:XX-YY` - [what changed]
- Tests Added: [list test files]
- Integration Tests: [filter-to-component tests]
- Build Status: npm run build [pass/fail]
- London Lessons Verified: [1-6 checklist]
- Issues Discovered: [any problems found]
- Notes for Next Thread: [context to carry forward]
```

---

## 6. User Experience

> **See also:** `APP_FLOW.md` for the full screen inventory, route map, and detailed navigation flows.

### Key User Flows

**Flow 1: First Visit -- Explore Overview**
1. User lands on the dashboard
2. Dark-themed interface loads with skeleton placeholders that resolve into data
3. KPI cards animate in with count-up numbers showing total daily ridership (~7M across all modes), recovery percentage (~85%), and mode breakdown
4. User scrolls down to see trend charts, map, and analysis sections
5. User gets an immediate sense of scale and current state of NYC transit

**Flow 2: Drill Into Trends**
1. User clicks a date range preset (e.g., "1Y") in the filter bar
2. ALL charts and KPI cards update to show the last year of data
3. User toggles off "Bridges & Tunnels" and "Access-A-Ride" to focus on core transit
4. Charts remove those modes' data AND recalculate totals (KPI "Total" number decreases)
5. User hovers over a point on the trend chart to see exact date and ridership numbers

**Flow 3: Explore Geography**
1. User scrolls to the subway station map
2. Sees stations as circles of varying size and color intensity
3. User clicks on a large circle (Times Square-42 St)
4. Popover shows station name, lines served (1/2/3/7/N/Q/R/W/S with color bullets), average daily entries (~175K), recovery at ~83% of pre-pandemic, sparkline trend
5. User zooms out to see the full system -- Manhattan dense, outer boroughs sparser

**Flow 4: Understand Recovery**
1. User scrolls to the pandemic recovery chart
2. Sees current ridership overlaid on pre-pandemic baseline with a shaded gap
3. Notices event markers: "NY PAUSE", "Phase 1 Reopening", "Full Reopening", "Congestion Pricing"
4. Switches mode to "Bus Only" and sees bus recovered to ~75%
5. Switches to "Access-A-Ride" and sees it ABOVE the baseline at 161% -- a unique NYC story
6. Views recovery progress bars showing each mode's current percentage

**Flow 5: Congestion Pricing Impact**
1. User scrolls to the congestion pricing section
2. Sees before/after comparison around January 2024 launch
3. Notes subway ridership bump and Bridges & Tunnels traffic decrease
4. Sees the "Pause" marker and the data reverting
5. Sees the "Resumption" marker (Feb 2025) and the pattern repeating
6. Gains an interactive understanding of the policy's impact

**Flow 6: Spot Patterns**
1. User views the day-of-week chart
2. Observes that subway ridership peaks Tuesday-Thursday, dips Monday and Friday
3. Notes that weekend ridership is recovering faster (percentage-wise) than weekday
4. Notes that bus ridership is more evenly distributed across days than subway
5. Reads annotation: "The remote work signature -- smaller weekday peaks, stronger weekends"

### Primary Interface

A single-page dashboard with a sticky filter bar and vertically scrolling card-based sections. No multi-page navigation. Everything lives on one screen with smooth scroll anchors.

### UX Requirements

- Modern, polished, production-grade feel -- not a Streamlit clone
- Dark theme default with professional palette (deep navy/charcoal backgrounds, vibrant data colors inspired by MTA's iconic mode and line colors)
- Mobile-responsive: usable on iPhone without horizontal scrolling
- Smooth, 60fps animations for transitions and hover states
- Charts must have clear labels, formatted numbers, and meaningful tooltips
- Map must be touch-friendly on mobile
- Loading states for all data-dependent components (no flash of empty content)
- Data source attribution visible but not distracting
- All filter interactions cause data recalculation in every component (not just visual changes)

### UI References

**Inspiration:**
- MTA's subway signage and design language: Helvetica, primary colors, authoritative feel
- London Transit Pulse (companion project): dark theme aesthetic, card-based layout, chart styling
- Linear app: dark theme, smooth animations, minimal chrome
- Vercel analytics dashboard: card-based layout, vibrant on dark
- Stripe dashboard: clear hierarchy, well-spaced cards

**Anti-patterns to avoid:**
- Streamlit default styling (the exact thing we're differentiating from)
- PowerBI/Tableau embed aesthetic (clunky, iframe-y)
- Jupyter notebook output (ugly default charts)
- Cluttered government dashboards with tiny text
- Charts that require a legend to decode but the legend is hidden
- Mode toggles that only change opacity instead of recalculating data

---

## 7. Data Model

### Core Data Source

**MTA Daily Ridership Data (2020-2025)**
- **URL:** https://data.ny.gov/Transportation/MTA-Daily-Ridership-Data-2020-2025/vxuj-8kew
- **Format:** CSV, downloadable directly (no API key needed)
- **Coverage:** March 2020 -- present (daily frequency)
- **Key advantage over TfL:** All 7 modes in a single CSV with pre-pandemic comparison percentages already computed
- **Columns:** Date, then pairs of (Total Estimated Ridership, % of Comparable Pre-Pandemic Day) for each mode
- **Station coordinates:** MTA GTFS static feed for all ~472 subway station complexes

### Processed Data Shapes

| File | Structure | Notes |
|------|-----------|-------|
| `data/daily.json` | `{ date, subway, bus, lirr, metroNorth, accessARide, bridgesTunnels, sir, total }[]` | Raw daily values for all 7 modes |
| `data/weekly.json` | Same shape, aggregated by ISO week | 7-day sums |
| `data/monthly.json` | Same shape, aggregated by month | Monthly sums |
| `data/dow.json` | `{ dayOfWeek, avgSubway, avgBus, avgLirr, avgMetroNorth, avgAccessARide, avgBridgesTunnels, avgSir }[]` | Average ridership by day of week |
| `data/recovery.json` | `{ date, subwayPct, busPct, lirrPct, metroNorthPct, accessARidePct, bridgesTunnelsPct, sirPct }[]` | Daily recovery percentages vs. pre-pandemic (from CSV) |
| `data/kpi.json` | `{ totalRidership, change7d, change30d, recoveryPct, byMode: {...} }` | Pre-computed KPI values |
| `data/stations.json` | `{ id, name, lat, lng, avgDailyRidership, lines: string[], borough }[]` | Subway station locations with ridership |
| `data/congestion-pricing.json` | `{ event, date, before30d: {...}, after30d: {...}, subwayDelta, bridgesDelta }[]` | Congestion pricing comparison data |

### Station Data

MTA publishes subway ridership at the station complex level (turnstile data). For the station map:

1. **Preferred:** Use MTA Subway Hourly Ridership data (by station complex) combined with GTFS stops.txt for coordinates. This gives actual per-station ridership.
2. **Fallback:** Use a curated list of the top 80-100 busiest subway stations with ridership estimates based on MTA published rankings.

For v1, attempt the **preferred approach** -- MTA data is more accessible than TfL's station data. If the hourly ridership dataset is too large, fall back to curated.

### Security & Privacy

No sensitive data. All source data is publicly available from MTA Open Data (data.ny.gov). No user data collected. No cookies, no analytics, no tracking. No API keys required at runtime. The `data/` directory is committed to the repository.

---

## 8. Integrations

### Required (MVP)

| Integration | Purpose | Auth |
|-------------|---------|------|
| MTA Open Data (data.ny.gov) | Source ridership CSV | None (free public download) |
| MTA GTFS Static Feed | Subway station coordinates | None (free public download) |
| OpenStreetMap / CartoDB | Map tiles | None (free tier) |
| Vercel | Hosting | GitHub integration |

### Future (v2)

| Integration | Purpose | Auth |
|-------------|---------|------|
| MTA Real-Time Feeds | Live service alerts, delays | MTA API key (free) |
| MTA Subway Hourly Ridership | Detailed per-station hourly data | None (data.ny.gov) |
| Mapbox GL JS | Higher-quality map tiles, 3D station view | Free tier API key |
| London Transit Pulse API | Cross-city comparison data | Internal |

---

## 9. Technical Specification

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSG for performance, React ecosystem, Vercel-native |
| **React** | React 18 (`^18.2.0`) | **Explicitly pinned -- do NOT use React 19** (incompatible with Next.js 14 stable; caused build failures in London build) |
| **Language** | TypeScript | Type safety for data shapes |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development, dark theme support |
| **Charts** | Recharts | React-native charting, good dark theme support, responsive |
| **Map** | Leaflet + react-leaflet | Free, no API key, good OSM integration |
| **Map Tiles** | CartoDB Dark Matter (OpenStreetMap) | Free, dark theme, good aesthetic |
| **Data Processing** | Node.js script with papaparse | Build-time CSV-to-JSON transformation |
| **Date Handling** | date-fns | Lightweight, tree-shakeable date utilities |
| **Theme** | next-themes | SSR-safe theme switching |
| **Icons** | lucide-react | Clean, consistent icon set |
| **Hosting** | Vercel | Free tier, excellent Next.js support |
| **Repo** | GitHub | Standard |

### Non-Negotiables

- [x] React 18 pinned in `package.json` (lesson from London: React 19 + Next.js 14 = build failures)
- [x] `data/` directory committed to git (lesson from London: gitignored data breaks Vercel builds)
- [x] Tests required (unit + component + integration tests for filter-to-component data flow)
- [x] `npm run build` verified locally before any deployment (lesson from London: deploy-first approach caused cascading issues)
- [x] All components consume shared filter state for data recalculation (lesson from London: dimming-only mode toggles were a bug)
- [x] Documentation required (README with setup, data source attribution)
- [x] Security considered (no secrets in client bundle, no user data, CSP headers)
- [x] Deployed to Vercel from start (not just localhost)
- [x] TypeScript strict mode -- no `any` types in data layer

### Architecture Principles

- **Static-first:** All data is pre-processed at build time. No runtime API calls, no database.
- **Single-page:** Everything on one scrollable page. No routing complexity.
- **Client-side filtering:** Date range and mode filters operate on client-side data. No server round-trips. **All components must consume the shared FilterContext -- mode toggles recalculate data values, not just visual state.**
- **Progressive enhancement:** Dashboard renders meaningful content without JavaScript (SSG HTML), then enhances with interactivity.
- **Performance budget:** < 3s initial load on 3G. JSON data files must be < 2MB total compressed.
- **Build verification:** Every thread ends with `npm run build`. No code merges that break the build.

---

## 10. Constraints

### Hard Constraints

- No runtime API keys required for any service (MTA data is free public CSV; map tiles are free)
- Must work on Vercel free tier
- Must be mobile-responsive (usable at 320px width)
- No database -- data is static JSON
- Total bundle size (JS + data) must be reasonable for fast load (< 5MB uncompressed)
- React 18 only (not React 19)
- `data/` directory must be committed to git
- `npm run build` must succeed locally before deployment

### Preferences

- Dark theme as default (matches data viz best practices for reducing eye strain)
- Prefer CSS animations over JS animation libraries where possible
- Keep dependencies minimal -- no heavy charting frameworks beyond Recharts
- Favor readability over cleverness in data transformation code
- Use semantic HTML for chart descriptions (screen reader basics)
- MTA design language for colors and typography feel

### Anti-Patterns

- **No React 19** -- pinned to React 18 for Next.js 14 compatibility
- **No gitignoring data files** -- `data/` must be committed for Vercel builds
- **No 3D effects or skeuomorphism** -- flat, modern aesthetic
- **No chart.js** -- Recharts is the chosen library; don't introduce alternatives
- **No Redux or Zustand** -- React context is sufficient for global filter state
- **No SSR for maps** -- Leaflet must be client-only (dynamic import)
- **No auto-refreshing data** -- v1 is static; don't build polling or WebSocket infrastructure
- **No visual-only mode toggles** -- toggling a mode must recalculate data, not just change CSS opacity
- **No deploying without local build verification** -- always run `next build` first

---

## 11. Future Vision

### v2 Direction

If v1 looks great and the data pipeline works well:

1. **Multi-City Comparison:** Side-by-side view with London Transit Pulse data. Compare recovery rates, mode splits, and commute patterns across NYC and London.
2. **Per-Station Detail:** Process MTA subway hourly ridership for station-level trends. Add station detail view with hourly patterns, peak hours, ridership rankings.
3. **Origin-Destination Flows:** Build Sankey or chord diagrams showing travel patterns between boroughs using MTA O-D data.
4. **Live Service Status:** Integrate MTA real-time feeds for subway service alerts, delays on the map.
5. **Time-of-Day Animation:** Animate the station map through a 24-hour cycle showing ridership intensity changing (morning commute, evening commute, nightlife).
6. **Congestion Pricing Deep Dive:** Expanded analysis with mode-shift data (did bridge/tunnel users switch to subway?), revenue data, and air quality correlation.
7. **Per-Line Analysis:** Break subway ridership into individual lines (A/C/E, 1/2/3, etc.) for line-level recovery comparison.
8. **Embed Mode:** Allow the dashboard (or individual charts) to be embedded in blog posts or articles via iframe.

### Opportunity Cost

Building NYC Transit Pulse means NOT building:
- A third city (Paris RATP or Tokyo Metro) in the same timeframe
- The multi-city comparison feature (deferred to v2)
- Deeper per-station analysis for the London dashboard
- A generic transit data framework that abstracts across cities

This is acceptable. NYC has the strongest data story (congestion pricing + MTA data quality) and the highest portfolio impact (NYC is more recognizable than most other transit systems).

---

## 12-15. Commercial Sections

*Skipped -- this is a personal portfolio project.*

---

## 16. Pre-Mortem Analysis

### Tigers (Real, Likely Risks)

| Risk | Impact | Mitigation |
|------|--------|------------|
| **React 19 / Next.js 14 mismatch** | Build failures, cascading dependency issues (happened in London build) | Pin React 18 explicitly in Thread 1; verify in every thread |
| **Gitignored data files break Vercel deploy** | Deployed site has no data (happened in London build) | Ensure `data/` is NOT in `.gitignore`; verify in Thread 1 |
| **Mode toggles only dimming, not recalculating** | KPIs and charts show stale data when modes toggled (happened in London build) | Architecture enforces filter context consumption in Thread 3; integration tests verify |
| **Build failure discovered only at deploy time** | Wasted time debugging on Vercel instead of locally | Every thread runs `npm run build`; Thread 7 has explicit local build gate |
| **Large station dataset (~472 complexes) slows map rendering** | Janky map performance on mobile | Use canvas renderer for Leaflet markers; lazy-load station data; consider clustering at low zoom levels |
| **MTA CSV format changes** | Data pipeline breaks on next refresh | Pin to a specific download date; validate column headers in processing script; fail loudly on unexpected format |

### Paper Tigers (Seem Scary, Actually Manageable)

| Risk | Why It's Manageable |
|------|---------------------|
| **7 modes is more complex than London's 6** | MTA puts all modes in one CSV with consistent structure. More modes = more lines in the chart but same processing pattern. |
| **Congestion pricing dates may be approximate** | The exact dates are well-documented in news. January 5, 2024 launch is confirmed. Approximate dates for pause/resume are fine for event markers. |
| **Station ridership requires a second dataset** | MTA publishes subway hourly ridership on data.ny.gov. Worst case, curate top 80-100 stations manually. |
| **Dark theme making charts hard to read** | Solved problem -- established in London build with Recharts + CartoDB Dark Matter. Same patterns apply. |
| **472 stations vs. London's 270** | More markers, but Leaflet handles thousands of markers fine. Canvas renderer solves performance if needed. |

### Elephants (Uncomfortable Truths)

| Truth | Response |
|-------|----------|
| **This is architecturally the same app as London Transit Pulse** | Yes. That's the point. The differentiation is in the data story (congestion pricing, paratransit anomaly, remote work patterns), the MTA design language, and the fact that it demonstrates the ability to build a data pipeline for a different data format. The architecture is intentionally similar -- it's a series, not a one-off. |
| **Static data means the dashboard goes stale** | Same as London. Build-time data means someone has to re-run the pipeline and redeploy. For a portfolio piece this is acceptable. The README documents the refresh process. |
| **Access-A-Ride data may have different characteristics** | Paratransit (Access-A-Ride) measures "scheduled trips" not "ridership." The 161% figure compares scheduled trips to pre-pandemic scheduled trips. This is still meaningful but should be noted in the UI. |
| **Congestion pricing impact is debated** | The dashboard should present the data neutrally without claiming causation. "Ridership after congestion pricing" not "ridership because of congestion pricing." Let users draw their own conclusions. |
| **MTA data starts March 2020 -- no 2019 baseline in the dataset** | The CSV includes "% of Comparable Pre-Pandemic Day" which encodes the baseline comparison. We use these percentages directly rather than needing raw 2019 data. If we want absolute 2019 numbers, we'd need a separate source. |

---

## 17. Definition of Done

MVP is complete when:

- [ ] Not embarrassing to show someone -- looks like a professional data product, not a Streamlit tutorial
- [ ] Core functionality works end-to-end -- KPIs, trend charts, map, recovery comparison, congestion pricing, day-of-week all render with real MTA data
- [ ] ALL global filters (date range, mode selection) affect ALL relevant charts with data recalculation (not just visual changes)
- [ ] Interactive subway map shows station markers with MTA line colors and responds to clicks
- [ ] Congestion pricing before/after comparison is clear and informative
- [ ] Dark theme is polished with consistent accent colors matching MTA design language
- [ ] Mobile-responsive at 320px minimum width
- [ ] `npm run build` succeeds locally
- [ ] Live on Vercel (not just localhost)
- [ ] Tests passing: unit tests + integration tests for filter-to-component data flow
- [ ] `data/` directory committed to git
- [ ] React 18 in `package.json` (not React 19)
- [ ] README exists with setup and data attribution
- [ ] Lighthouse performance score > 85
- [ ] Data source clearly attributed (MTA Open Data via data.ny.gov)

---

## 18. Open Questions

1. **Congestion pricing exact dates:** The January 5, 2024 launch date is confirmed. The pause date (approximately June 2024) and resumption date (approximately February 2025) should be verified against MTA announcements before Thread 5. If dates are approximate, note this in the UI.
2. **Station ridership dataset:** Should we process the full MTA Subway Hourly Ridership dataset for accurate per-station numbers, or curate top 80-100 stations? (Recommendation: attempt full dataset in Thread 1; fall back to curated if processing is too complex for MVP timeline.)
3. **Access-A-Ride terminology:** The CSV tracks "Total Scheduled Trips" not "Ridership." Should we label it as "Trips" in the UI or normalize to "Ridership" for consistency? (Recommendation: use "Trips" with a tooltip explaining the distinction.)
4. **Bridges & Tunnels terminology:** This mode measures "Total Traffic" (vehicles), not people. Should we exclude it from total ridership calculations? (Recommendation: include it but label as "Vehicle Traffic" and note it in tooltips. Separate from per-person ridership in KPI totals.)
5. **Staten Island Railway visibility:** SIR has very low ridership compared to other modes. Should it be on by default in the mode filter or off? (Recommendation: on by default but low visual weight. It's a legitimate MTA mode.)
6. **MTA data freshness:** How often is the MTA CSV updated? If it's updated weekly, note the typical lag in the footer. (Research suggests daily updates on data.ny.gov.)

---

## Appendix: Agent Notes

*This section is populated by agents during the build process.*

### London Build Lessons (Mandatory Reference)

These 6 issues occurred during the London Transit Pulse build and MUST be prevented in the NYC build:

| # | Issue | Root Cause | Prevention |
|---|-------|-----------|------------|
| 1 | React 19 / Next.js 14 build failures | `npx create-next-app` defaulted to React 19 | Pin React 18 in Thread 1, verify in every thread |
| 2 | Gitignored data broke Vercel deploy | Default `.gitignore` excluded `data/` | Remove `data/` from `.gitignore` in Thread 1 |
| 3 | Build failures found only at deploy | No local build verification | Every thread runs `npm run build`; Thread 7 has hard gate |
| 4 | KPIs not wired to filter system | Components read static data, not filtered | Architecture enforces FilterContext consumption in Thread 3 |
| 5 | No integration tests for filter flow | Only unit tests existed | Every thread writes filter-to-component integration tests |
| 6 | Mode toggles dimmed visually, didn't recalculate | Toggle changed CSS opacity, not data input | Specify that mode toggles affect data values in filter architecture |

### Technical Architect
[Architecture decisions, rationale]

### UX/UI Designer
[Design decisions, component notes]

### DevSecOps
[Infrastructure notes, security considerations]

### Other Notes
[Anything else relevant]
