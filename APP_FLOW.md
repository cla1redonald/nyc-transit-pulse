# APP_FLOW.md: NYC Transit Pulse

> Detailed screen inventory, component map, navigation flows, and state management for the NYC Transit Pulse dashboard.

---

## 1. Application Structure

NYC Transit Pulse is a **single-page application** -- all content lives on one scrollable page. There is no multi-page routing. The URL is always `/`.

### Route Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | The entire application -- KPIs, charts, map, analysis |

No other routes exist in v1. No `/about`, no `/settings`, no `/station/:id`. Everything is on one page with scroll anchors.

---

## 2. Screen Inventory

The single page is composed of **vertical sections** that scroll naturally. Each section is a self-contained card or group of cards within the responsive grid.

### Section Layout (Top to Bottom)

```
+------------------------------------------------------------------+
| HEADER                                                            |
| [NYC Transit Pulse logo/title]          [Theme Toggle] [GitHub]   |
+------------------------------------------------------------------+
| GLOBAL FILTERS (sticky on scroll)                                 |
| [7d] [30d] [90d] [YTD] [1Y] [All] [Custom...]                  |
| [Subway] [Bus] [LIRR] [Metro-N] [AAR] [B&T] [SIR]              |
+------------------------------------------------------------------+
| KPI CARDS ROW                                                     |
| +----------------+ +----------------+ +----------------+          |
| | Total Riders   | | vs Last Week   | | Recovery %     |          |
| | 7.2M /day      | | +1.4%          | | 85% of pre-    |          |
| | [sparkline]    | | [sparkline]    | | pandemic       |          |
| +----------------+ +----------------+ +----------------+          |
| +--------+ +--------+ +--------+ +--------+ +--------+           |
| | Subway | | Bus    | | LIRR   | | Metro-N| | Other  |           |
| | 3.8M   | | 1.9M   | | 315K   | | 280K   | | 850K   |           |
| +--------+ +--------+ +--------+ +--------+ +--------+           |
+------------------------------------------------------------------+
| RIDERSHIP TREND CHART (full width)                                |
| Multi-line chart showing daily ridership by mode over time        |
| [Rolling Avg toggle]                                              |
+------------------------------------------------------------------+
| TWO-COLUMN LAYOUT                                                 |
| +-----------------------------+ +-------------------------------+ |
| | SUBWAY STATION MAP          | | PANDEMIC RECOVERY CHART       | |
| | [Leaflet map with           | | Current vs. pre-pandemic      | |
| |  station circles across     | | baseline with shaded gap      | |
| |  5 boroughs]                | | [Event markers]               | |
| |                             | | [Recovery % by mode bars]     | |
| | [Legend: Low --- High]      | | [Access-A-Ride at 161%!]      | |
| +-----------------------------+ +-------------------------------+ |
+------------------------------------------------------------------+
| CONGESTION PRICING IMPACT (full width)                            |
| Before/after comparison around Jan 2024 launch, pause, Feb 2025  |
| Subway ridership vs. Bridges & Tunnels traffic                    |
+------------------------------------------------------------------+
| DAY-OF-WEEK PATTERN CHART (full width)                            |
| Grouped bar chart: weekday vs weekend ridership by mode           |
| [Remote work annotation]                                          |
+------------------------------------------------------------------+
| MODE COMPARISON CHART (full width)                                |
| Stacked area chart showing ridership composition over time        |
| [Paratransit surge visible as growing slice]                      |
+------------------------------------------------------------------+
| FOOTER                                                            |
| Data: MTA Open Data (data.ny.gov) | Last processed: [date]       |
| Built with Next.js, Recharts, and Leaflet | GitHub | Vercel       |
+------------------------------------------------------------------+
```

---

## 3. Component Hierarchy

```
<RootLayout>                          -- next-themes provider, global styles
  <ThemeProvider>
    <FilterProvider>                   -- global filter context wrapping EVERYTHING
      <DashboardShell>                -- header, main content wrapper
        <Header>                      -- title, theme toggle, GitHub link
          <ThemeToggle />             -- sun/moon icon button
        </Header>
        <main>
          <GlobalFilters>             -- sticky filter bar
            <DateRangeSelector />     -- preset pills + custom date picker
            <ModeFilter />            -- mode toggle chips with MTA colors
          </GlobalFilters>
          <KPISection>                -- consumes FilterContext
            <KPICard />               -- x5-7: total, change, recovery, subway, bus, rail, other
          </KPISection>
          <RidershipTrendSection>     -- consumes FilterContext
            <SectionHeader />
            <RidershipTrendChart />   -- Recharts multi-line
            <RollingAverageToggle />
          </RidershipTrendSection>
          <MapAndRecoverySection>     -- 2-column grid
            <StationMapSection>       -- consumes FilterContext
              <SectionHeader />
              <StationMap />          -- Leaflet (dynamic import, no SSR)
                <StationMarker />     -- circle markers x80-472
                <StationPopover />    -- click-triggered detail card
                <MapLegend />
            </StationMapSection>
            <PandemicRecoverySection> -- consumes FilterContext
              <SectionHeader />
              <PandemicRecoveryChart />  -- Recharts area with gap
              <EventMarkers />        -- vertical reference lines
              <RecoveryKPIBars />     -- progress bars by mode
            </PandemicRecoverySection>
          </MapAndRecoverySection>
          <CongestionPricingSection>  -- consumes FilterContext
            <SectionHeader />
            <CongestionPricingChart /> -- before/after comparison
            <CongestionAnnotations />  -- impact callouts
          </CongestionPricingSection>
          <DayOfWeekSection>          -- consumes FilterContext
            <SectionHeader />
            <DayOfWeekChart />        -- grouped bars
            <PatternAnnotation />     -- remote work insight
          </DayOfWeekSection>
          <ModeComparisonSection>     -- consumes FilterContext
            <SectionHeader />
            <ModeComparisonChart />   -- stacked area
          </ModeComparisonSection>
          <Footer>                    -- attribution, links
            <DataAttribution />
          </Footer>
        </main>
      </DashboardShell>
    </FilterProvider>
  </ThemeProvider>
</RootLayout>
```

**Critical Architecture Note:** `<FilterProvider>` wraps the entire application. Every section component consumes `FilterContext` via hooks. When filters change, every section recalculates its data -- not just visual presentation. This is the #1 architectural lesson from the London build.

---

## 4. Component Specifications

### 4.1 Header

| Property | Value |
|----------|-------|
| Position | Fixed top, z-50 |
| Background | Dark surface with subtle border-bottom |
| Height | 56px (desktop), 48px (mobile) |
| Content | Logo/title left, theme toggle + GitHub icon right |

**Title:** "NYC Transit Pulse" in semibold, with a subtle animated pulse dot (transit-themed) next to the title on initial load. Consider using Helvetica Neue or system-ui to nod to MTA signage typography.

**Theme Toggle:** `<ThemeToggle />` -- shadcn/ui button with `lucide-react` Sun/Moon icons. Toggles between dark and light themes via `next-themes`.

**GitHub Link:** Icon button linking to the repository.

---

### 4.2 Global Filters

| Property | Value |
|----------|-------|
| Position | Sticky top (below header), z-40 |
| Background | Dark surface with backdrop-blur |
| Layout | Two rows: date range on top, mode filters below |
| Mobile | Horizontally scrollable pill rows |

**Date Range Selector:**

| Preset | Date Range |
|--------|-----------|
| 7d | Last 7 days |
| 30d | Last 30 days |
| 90d | Last 90 days |
| YTD | January 1 of current year to today |
| 1Y | Last 365 days |
| All | Entire dataset (March 2020 - present) |
| Custom | Opens shadcn/ui date range picker popover |

Default selection: **1Y** (shows the last year of data on first load).

**Mode Filter Chips:**

| Mode | Color | Label | Default |
|------|-------|-------|---------|
| Subway | `#0039A6` (MTA blue) | Subway | On |
| Bus | `#FF6319` (MTA bus orange) | Bus | On |
| LIRR | `#FCCC0A` (LIRR yellow) | LIRR | On |
| Metro-North | `#00A65C` (Metro-North green) | Metro-N | On |
| Access-A-Ride | `#B933AD` (purple) | AAR | Off |
| Bridges & Tunnels | `#6D6E71` (gray) | B&T | Off |
| Staten Island Railway | `#0039A6` (lighter blue) | SIR | Off |

Chips are pill-shaped buttons with the mode's color as background when active, outline when inactive. Clicking toggles the mode on/off. **Toggling a mode must recalculate data values in all consuming components -- not just dim the visual.** At least one mode must remain active (prevent deselecting all).

**Filter State Flow:**
1. User clicks a mode chip or date preset
2. `FilterContext` state updates
3. Every consuming component's `useFilteredData()` hook recomputes
4. Charts, KPIs, and map re-render with new calculated values
5. KPI "Total" number reflects only active modes' sum

---

### 4.3 KPI Cards

Each card is a `<KPICard>` component with consistent structure:

```
+----------------------------------+
| [icon]  Label                    |
|                                  |
|  3,812,448                       |  <-- large formatted number
|  +1.4% vs last week  [arrow-up] |  <-- delta with directional arrow
|  [~~~~~~~~sparkline~~~~~~~~~]    |  <-- 30-day trend sparkline
+----------------------------------+
```

| Card | Label | Value Source | Delta Comparison |
|------|-------|-------------|------------------|
| Total Daily Ridership | "Total Ridership" | Sum of all **active** modes for latest date in range | vs. same day last week |
| Weekly Change | "Week over Week" | 7-day sum change across active modes | Current week vs. prior week |
| Recovery Percentage | "vs. Pre-Pandemic" | Weighted average recovery % across **active** modes | Change over last 30 days |
| Subway | "Subway" | Latest subway ridership (if active) | vs. prior period |
| Bus | "Bus" | Latest bus ridership (if active) | vs. prior period |
| Commuter Rail | "Commuter Rail" | LIRR + Metro-North combined (if active) | vs. prior period |

Mode-specific KPI cards only appear for active modes. If a mode is toggled off, its KPI card collapses (not just dims). The "Total" card always reflects only active modes.

**KPI Card Behavior:**
- Numbers animate with a count-up effect on initial page load (0 to actual value over ~1 second)
- Delta arrows are green (up) or red (down) with percentage
- Sparklines are tiny line charts (no axes, no labels) showing 30-day trend
- **Cards recalculate when filters change** -- Total reflects active modes' sum; Recovery reflects active modes' weighted average

**Responsive Layout:**
- Desktop (>1024px): 6 cards in a row (or 3+3)
- Tablet (640-1024px): 3 cards per row, 2 rows
- Mobile (<640px): 2 cards per row, 3 rows

---

### 4.4 Ridership Trend Chart

| Property | Value |
|----------|-------|
| Chart Type | Multi-line (Recharts `<LineChart>`) |
| Width | Full container width, responsive |
| Height | 400px desktop, 300px mobile |
| X-Axis | Date (formatted: "Jan 2024", "Feb 2024", etc.) |
| Y-Axis | Ridership count (compact: "1M", "2.5M") |
| Lines | One per active mode, using MTA mode colors |
| Tooltip | Date, ridership by mode, total |
| Grid | Subtle dashed lines, low opacity on dark background |

**Rolling Average Toggle:** A small switch above the chart. When enabled, lines show 7-day rolling average instead of raw daily values. Smooths out weekend dips and makes trends clearer.

**Interactions:**
- Hover: Crosshair tooltip showing date and values for all visible modes
- Click date range presets: Chart re-renders with new date bounds (data recalculated, not just zoomed)
- Toggle modes: Lines appear/disappear AND y-axis rescales to remaining data
- Responsive: On mobile, reduce x-axis tick count to prevent overlap

---

### 4.5 Subway Station Map

| Property | Value |
|----------|-------|
| Map Library | Leaflet via react-leaflet |
| Tile Provider | CartoDB Dark Matter |
| Center | Manhattan: [40.7580, -73.9855] |
| Zoom | 11-12 (shows Manhattan + inner boroughs) |
| Height | 500px desktop, 400px tablet, 350px mobile |
| Markers | CircleMarker for each subway station complex |

**Station Markers:**

| Property | Mapping |
|----------|---------|
| Radius | 4px (low ridership) to 20px (highest ridership), linear scale |
| Color | Cool blue (#0039A6) at low end to warm orange (#FF6319) at high end |
| Opacity | 0.7 fill, 1.0 stroke |
| Stroke | 1px white for visibility against dark tiles |

**Station Popover (on click):**

```
+------------------------------------+
| Times Square-42 St            [x]  |
| Lines: 1 2 3 7 N Q R W S          |
|        (color-coded bullets)       |
| Borough: Manhattan                 |
|                                     |
| Avg Daily Entries: 174,930         |
| Recovery: 83% of pre-pandemic     |
| [===========--------] 83%          |
|                                     |
| [~~~~~~~sparkline~~~~~~~]          |
| Last 30 days trend                  |
+------------------------------------+
```

The subway line bullets use actual MTA line colors:
- 1/2/3: Red `#EE352E`
- 4/5/6: Green `#00933C`
- 7: Purple `#B933AD`
- A/C/E: Blue `#0039A6`
- B/D/F/M: Orange `#FF6319`
- G: Light Green `#6CBE45`
- J/Z: Brown `#996633`
- L: Gray `#A7A9AC`
- N/Q/R/W: Yellow `#FCCC0A`
- S (Shuttle): Dark Gray `#808183`

- Desktop: Leaflet popup anchored to marker
- Mobile: Bottom sheet that slides up from the bottom of the map

**Map Legend:**

Positioned bottom-left of the map. Shows a horizontal gradient bar from blue to orange with labels "Low Ridership" and "High Ridership". Small and unobtrusive.

**Map Interactions:**
- Pan: Click-drag (desktop) or touch-drag (mobile)
- Zoom: Scroll wheel, pinch, or zoom buttons
- Click marker: Open station popover
- Click elsewhere: Close popover
- **Global filters: Date range changes re-aggregate station ridership for the selected period**

---

### 4.6 Pandemic Recovery Chart

| Property | Value |
|----------|-------|
| Chart Type | Area chart with two layers (Recharts `<AreaChart>`) |
| Width | Full container width within the 2-column cell |
| Height | 500px (matches map height) |
| X-Axis | Date (monthly granularity for readability) |
| Y-Axis | Recovery percentage (0% - 170% to accommodate Access-A-Ride) |

**Visual Design:**
- **Pre-pandemic baseline:** Horizontal line at 100% (represents full recovery)
- **Current recovery %:** Colored area showing recovery trajectory per mode
- **Recovery gap:** The space between current line and 100% baseline, filled with semi-transparent gradient
- **Above-baseline highlight:** Access-A-Ride at 161% shown ABOVE the 100% line with a distinct color treatment (gold/amber glow) and annotation

**Event Markers:**

Vertical dashed lines at key dates with small labels:

| Date | Label |
|------|-------|
| 2020-03-22 | NY PAUSE |
| 2020-06-08 | Phase 1 Reopening |
| 2021-02-01 | Indoor Dining Returns |
| 2021-06-15 | Full Reopening |
| 2022-01-03 | Omicron Peak |
| 2024-01-05 | Congestion Pricing |
| 2024-06-XX | CP Paused |
| 2025-02-XX | CP Resumed |

Event markers appear as thin vertical lines with rotated text labels. On mobile, show only the top 4 most significant events to avoid clutter.

**Recovery KPI Bars (below chart):**

```
Subway          [=============--------] 85%
Bus             [===========---------] 75%
LIRR            [============--------] 82%
Metro-North     [============--------] 80%
Access-A-Ride   [=====================>>>] 161%  *
Bridges & Tun.  [================-----] 95%
SIR             [===========----------] 72%

* Measures scheduled trips, not ridership
```

Access-A-Ride bar extends beyond 100% with a distinct visual treatment.

---

### 4.7 Congestion Pricing Impact Chart

| Property | Value |
|----------|-------|
| Chart Type | Dual-panel comparison (Recharts `<ComposedChart>`) |
| Width | Full container width |
| Height | 400px desktop, 320px mobile |
| X-Axis | Days relative to event (-30 to +30) or absolute dates |
| Y-Axis | Ridership / traffic volume |

**Visual Design:**
- Two overlaid areas: Subway ridership (blue) and Bridges & Tunnels traffic (gray)
- Three vertical event markers: Launch (Jan 2024), Pause (~Jun 2024), Resumption (~Feb 2025)
- Before/after shading: light background highlight for "after" periods
- Callout annotations: "+X% subway" and "-Y% bridge traffic" near each event

**Key Narrative:**
- Subway ridership expected to increase as commuters switch from driving
- Bridges & Tunnels traffic expected to decrease
- The pause period serves as a natural control group
- Resumption confirms the pattern

**Interactions:**
- Hover for exact values
- Responds to date range filter (can zoom into specific event windows)
- Responds to mode filter (can isolate subway-only or bridge-only view)

---

### 4.8 Day-of-Week Pattern Chart

| Property | Value |
|----------|-------|
| Chart Type | Grouped bar chart (Recharts `<BarChart>`) |
| Width | Full container width |
| Height | 350px desktop, 280px mobile |
| X-Axis | Days of week (Mon, Tue, Wed, Thu, Fri, Sat, Sun) |
| Y-Axis | Average ridership (compact notation) |
| Bars | One group per day, bars for each active mode |

**Visual Design:**
- Bars use MTA mode colors with slight transparency
- Weekday bars (Mon-Fri) have a subtle background highlight to distinguish from weekend
- Tooltip shows exact ridership values for all modes on that day
- Clear visual pattern: Tue-Thu peak, Mon/Fri slightly lower, Sat-Sun significantly lower for subway; bus more evenly distributed

**Insights Annotation:**
A text note below the chart: "Subway ridership peaks Tuesday-Thursday, while bus ridership is more evenly distributed. Weekend subway usage is recovering faster than weekday commuting -- the signature of remote work reshaping NYC transit patterns."

---

### 4.9 Mode Comparison Chart

| Property | Value |
|----------|-------|
| Chart Type | Stacked area chart (Recharts `<AreaChart>` with stacked areas) |
| Width | Full container width |
| Height | 350px desktop, 280px mobile |
| X-Axis | Date |
| Y-Axis | Total ridership |
| Areas | Stacked by mode, using MTA mode colors |

Shows how total ridership is composed across modes over time. Subway dominates but the relative proportions shift. Key observation: Access-A-Ride's slice grows proportionally from 2020 to present. Bus share is relatively stable. LIRR and Metro-North show gradual recovery.

---

### 4.10 Footer

| Property | Value |
|----------|-------|
| Background | Slightly darker than main background |
| Layout | Centered text, single or two rows |
| Content | Data attribution, last processed date, GitHub link, companion project link |

```
Data: MTA Open Data (data.ny.gov) | Last updated: February 2026
Companion: London Transit Pulse | Built with Next.js, Recharts, Leaflet | GitHub
```

---

## 5. State Management

### Global Filter Context

A React context (`FilterContext`) that **ALL** chart and data components consume. No external state library needed.

```typescript
interface FilterState {
  dateRange: {
    start: Date
    end: Date
    preset: '7d' | '30d' | '90d' | 'ytd' | '1y' | 'all' | 'custom'
  }
  activeModes: Set<TransitMode>
  rollingAverage: boolean
}

type TransitMode =
  | 'subway'
  | 'bus'
  | 'lirr'
  | 'metroNorth'
  | 'accessARide'
  | 'bridgesTunnels'
  | 'sir'
```

**Critical Architecture Rule:** Every data-displaying component MUST consume `FilterContext`. There must be NO component that reads raw data without filtering. This prevents the London build issue where KPIs showed unfiltered totals while charts showed filtered data.

**Filter Flow:**
1. User interacts with `<GlobalFilters>` component
2. Context state updates
3. ALL chart components, ALL KPI cards, and the station map re-render with filtered data
4. Data filtering happens in custom hooks (`useFilteredData`) that memoize results
5. Mode toggles cause **data recalculation**, not just visual show/hide

### Data Loading

All data is imported from static JSON files at build time via Next.js:

```typescript
// Data loaded once, filtered client-side
import dailyData from '@/data/daily.json'
import kpiData from '@/data/kpi.json'
import stationData from '@/data/stations.json'
import recoveryData from '@/data/recovery.json'
import congestionData from '@/data/congestion-pricing.json'
// etc.
```

Each chart section has a custom hook that:
1. Reads raw data from the import
2. Reads current filters from `FilterContext`
3. Returns filtered + transformed data for that specific chart
4. Memoizes the result to prevent unnecessary recomputation

**Hook inventory:**
- `useFilteredDaily()` -- filtered daily data for trend chart
- `useFilteredRecovery()` -- filtered recovery percentages
- `useStationData()` -- station data aggregated for selected date range
- `useKPIData()` -- KPI values computed from active modes and date range
- `useCongestionPricing()` -- congestion pricing comparison data
- `useDayOfWeek()` -- day-of-week averages for active modes and date range

---

## 6. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640px - 1024px | Two columns where appropriate |
| Desktop | > 1024px | Full multi-column grid |

### Section-by-Section Responsive Rules

| Section | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Header | Full width, 56px | Full width, 48px | Full width, 48px |
| Global Filters | Two rows, all visible | Two rows, all visible | Horizontally scrollable pills |
| KPI Cards | 3 per row (2 rows) | 3 per row (2 rows) | 2 per row (3 rows) |
| Trend Chart | 400px height | 350px height | 300px, fewer x-ticks |
| Map + Recovery | Side-by-side (50/50) | Stacked (map on top) | Stacked (map on top) |
| Map | 500px height | 400px height | 350px height |
| Congestion Pricing | 400px height | 350px height | 320px height |
| DOW Chart | 350px height | 300px height | 280px, abbreviated labels |
| Mode Comparison | 350px height | 300px height | 280px height |
| Footer | Single row | Two rows | Two rows |

### Mobile-Specific Adjustments

- **Filter bar:** Mode chips scroll horizontally with fade edges indicating more content; chips use abbreviations (Subway, Bus, LIRR, Metro-N, AAR, B&T, SIR)
- **Charts:** Reduce x-axis tick count to prevent label overlap (show every 3rd month instead of every month)
- **Map popovers:** Switch from Leaflet popup to a bottom sheet overlay
- **KPI sparklines:** Hide on mobile to save space (show only number + delta)
- **Touch targets:** All interactive elements minimum 44px touch target
- **Congestion pricing chart:** Simplify to single-panel view on mobile (stacked instead of side-by-side)

---

## 7. Theme System

### Color Tokens

```css
/* Dark Theme (default) */
--background: #0a0a0f;
--surface: #111118;
--surface-raised: #1a1a2e;
--surface-overlay: #232338;
--border: #2a2a3e;
--text-primary: #f0f0f5;
--text-secondary: #8888a0;
--text-muted: #555568;

/* Light Theme */
--background: #f8f9fc;
--surface: #ffffff;
--surface-raised: #f0f1f5;
--surface-overlay: #e8e9f0;
--border: #d0d1d8;
--text-primary: #1a1a2e;
--text-secondary: #555568;
--text-muted: #8888a0;
```

### Mode Colors (Consistent Across Themes)

```css
/* Primary mode colors */
--color-subway: #0039A6;         /* MTA blue */
--color-bus: #FF6319;            /* MTA bus orange */
--color-lirr: #FCCC0A;          /* LIRR yellow/gold */
--color-metro-north: #00A65C;   /* Metro-North green */
--color-access-a-ride: #B933AD; /* Purple */
--color-bridges-tunnels: #6D6E71; /* Gray */
--color-sir: #1D5DA8;           /* SIR lighter blue */

/* Subway line colors (for station popovers) */
--line-123: #EE352E;            /* Red */
--line-456: #00933C;            /* Green */
--line-7: #B933AD;              /* Purple */
--line-ace: #0039A6;            /* Blue */
--line-bdfm: #FF6319;           /* Orange */
--line-g: #6CBE45;              /* Light green */
--line-jz: #996633;             /* Brown */
--line-l: #A7A9AC;              /* Gray */
--line-nqrw: #FCCC0A;           /* Yellow */
--line-s: #808183;              /* Dark gray */
```

### Chart Theming

| Element | Dark Theme | Light Theme |
|---------|-----------|-------------|
| Grid lines | `#2a2a3e` (15% opacity) | `#d0d1d8` (30% opacity) |
| Axis text | `#8888a0` | `#555568` |
| Tooltip background | `#1a1a2e` | `#ffffff` |
| Tooltip border | `#2a2a3e` | `#d0d1d8` |
| Tooltip text | `#f0f0f5` | `#1a1a2e` |

---

## 8. Animation & Transitions

### Page Load Sequence

1. **0ms:** Page shell renders with dark background
2. **100ms:** Header and filter bar appear (no animation, instant)
3. **200ms:** KPI card skeletons visible (pulsing dark rectangles)
4. **400ms:** KPI numbers begin count-up animation (0 to actual value, eased, ~800ms duration)
5. **600ms:** Charts begin rendering (fade-in from 0 opacity, 300ms duration, staggered by 100ms per section)
6. **800ms:** Map tiles begin loading (Leaflet handles its own loading)
7. **1200ms:** All content visible, animations complete

### Interaction Animations

| Interaction | Animation |
|-------------|-----------|
| Date range change | Charts cross-fade to new data (200ms); KPIs recalculate with count animation |
| Mode toggle | Lines/bars fade in/out (300ms); KPI totals recalculate with count animation |
| Theme toggle | All colors transition smoothly (200ms, CSS transitions) |
| Chart hover | Tooltip appears instantly (no delay) |
| Station click | Popover scales up from marker point (150ms, ease-out) |
| Scroll into view | Sections fade in + translate up 20px (400ms, ease-out) |
| KPI number change | Counter animates from old value to new (600ms) |

### Performance Guidelines

- Use CSS `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, or `margin` (causes layout thrash)
- Use `will-change: transform` on animated elements
- Disable scroll-triggered animations if `prefers-reduced-motion: reduce` is set

---

## 9. Loading & Error States

### Loading States

Every data-dependent component has a skeleton loader that matches its final dimensions:

| Component | Skeleton |
|-----------|----------|
| KPI Card | Dark rounded rectangle with pulsing gradient |
| Trend Chart | Dark rectangle at chart height with faint horizontal lines |
| Station Map | Dark rectangle with subtle "Loading map..." text |
| Recovery Chart | Same as trend chart skeleton |
| Congestion Pricing | Dark rectangle with faint vertical event-marker placeholders |
| DOW Chart | Dark rectangle with vertical bar-shaped placeholders |
| Mode Comparison | Same as trend chart skeleton |

### Error States

If static JSON fails to load (corrupted build, missing file):

```
+----------------------------------+
| [alert icon]                     |
| Unable to load ridership data    |
| Try refreshing the page          |
| [Refresh button]                 |
+----------------------------------+
```

Error boundaries wrap each chart section independently -- one broken chart does not take down the whole dashboard.

### Empty States

If filters result in no data (e.g., date range with no records, all modes toggled off):

```
+----------------------------------+
| [chart icon, dimmed]             |
| No data for selected filters     |
| Try expanding the date range or  |
| enabling more transit modes      |
+----------------------------------+
```

For mode-specific empty states: if the only active mode is Access-A-Ride and the user is viewing the station map, show: "Station map shows subway stations only. Enable Subway mode to see station data."

---

## 10. Accessibility Baseline

While a full WCAG audit is out of scope for v1, these basics must be implemented:

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets WCAG AA (4.5:1 for normal text) |
| Focus indicators | Visible focus rings on all interactive elements |
| Keyboard navigation | Tab through filters, Enter to activate |
| Chart alt text | Each chart section has an `aria-label` describing its content |
| Map a11y | Map has `role="img"` with descriptive `aria-label`; station data available as a visually hidden table |
| Reduced motion | Respect `prefers-reduced-motion` -- disable scroll animations, count-up effects |
| Semantic HTML | Use `<main>`, `<header>`, `<footer>`, `<section>`, `<h2>` for chart titles |
| Mode filter a11y | Mode chips have `aria-pressed` state and descriptive labels |

---

## 11. File Structure

```
nyc-transit-pulse/
  src/
    app/
      layout.tsx              -- RootLayout with ThemeProvider + FilterProvider
      page.tsx                -- Main dashboard page (composition)
      globals.css             -- Theme tokens, base styles, MTA color variables
    components/
      layout/
        DashboardShell.tsx    -- Header + main wrapper
        Header.tsx            -- Title, theme toggle, links
        Footer.tsx            -- Attribution, links
        ThemeToggle.tsx       -- Dark/light switch
      filters/
        GlobalFilters.tsx     -- Filter bar container
        DateRangeSelector.tsx -- Date presets + custom picker
        ModeFilter.tsx        -- Mode toggle chips with MTA colors
      kpi/
        KPISection.tsx        -- KPI cards grid (consumes FilterContext)
        KPICard.tsx           -- Individual KPI card with sparkline
      charts/
        RidershipTrendChart.tsx    -- Multi-line time series
        ModeComparisonChart.tsx    -- Stacked area chart
        PandemicRecoveryChart.tsx  -- Recovery gap visualization
        CongestionPricingChart.tsx -- Before/after congestion pricing
        DayOfWeekChart.tsx         -- Grouped bar chart
        RecoveryKPIBars.tsx        -- Progress bars by mode
        ChartSkeleton.tsx          -- Reusable loading skeleton
        EventMarkers.tsx           -- Reusable vertical timeline markers
      map/
        StationMap.tsx        -- Leaflet map (dynamic import, no SSR)
        StationMarker.tsx     -- Circle marker component
        StationPopover.tsx    -- Station detail popup/sheet with line colors
        MapLegend.tsx         -- Ridership intensity legend
      ui/                     -- shadcn/ui components
        button.tsx
        card.tsx
        popover.tsx
        date-picker.tsx
        badge.tsx
        skeleton.tsx
        switch.tsx
    lib/
      filter-context.tsx      -- Global filter state context + provider
      use-filtered-daily.ts   -- Hook for filtered daily data
      use-filtered-recovery.ts -- Hook for filtered recovery data
      use-station-data.ts     -- Hook for station data (date-range aware)
      use-kpi-data.ts         -- Hook for KPI computations (mode-aware)
      use-congestion-pricing.ts -- Hook for congestion pricing comparison
      use-day-of-week.ts      -- Hook for DOW averages (filter-aware)
      format.ts               -- Number/date formatting utilities
      colors.ts               -- Mode color constants, subway line colors
      constants.ts            -- Mode names, event markers, labels
    types/
      transit.ts              -- All TypeScript interfaces
  data/                       -- ** NOT GITIGNORED -- committed to repo **
    daily.json                -- Processed daily ridership (all 7 modes)
    weekly.json               -- Processed weekly ridership
    monthly.json              -- Processed monthly ridership
    dow.json                  -- Day-of-week averages
    recovery.json             -- Recovery percentages vs. pre-pandemic
    kpi.json                  -- Pre-computed KPI values
    stations.json             -- Subway station locations + ridership
    congestion-pricing.json   -- Congestion pricing event comparison data
  scripts/
    process-data.ts           -- MTA CSV-to-JSON processing pipeline
  public/
    og-image.png              -- Social sharing image (NYC themed)
  __tests__/
    process-data.test.ts      -- Data pipeline tests
    filter-context.test.tsx   -- Filter state tests
    kpi-card.test.tsx         -- KPI component tests
    format.test.ts            -- Formatting utility tests
    charts.test.tsx           -- Chart rendering tests
    filter-integration.test.tsx -- ** Filter-to-component integration tests **
```

---

## 12. Data Flow Diagram

```
[MTA Open Data (data.ny.gov)]
  |
  | CSV download (no API key)
  v
[scripts/process-data.ts]       <-- runs at build time
  |
  v
[data/*.json files]              <-- static JSON COMMITTED to repo
  |
  v
[Next.js static imports]         <-- imported in hooks
  |
  v
[FilterProvider / FilterContext]  <-- wraps ENTIRE app; user interactions set filters
  |
  v
[Custom Hooks]                   <-- useFilteredDaily, useKPIData, useStationData, etc.
  (memoized filtering)            <-- ALL hooks read from FilterContext
  |                                <-- Mode toggles cause data RECALCULATION
  v
[Chart Components + KPI Cards + Map]  <-- Recharts, Leaflet render FILTERED data
```

There are no API calls at runtime. No database queries. No WebSocket connections. Data flows from static JSON through React context and hooks to chart components. Filtering and aggregation happen entirely in the browser. **Every component consumes FilterContext -- no exceptions.**
