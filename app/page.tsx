import dynamic from 'next/dynamic'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { GlobalFilters } from '@/components/filters/GlobalFilters'
import { KPISection } from '@/components/kpi/KPISection'
import { RidershipTrendChart } from '@/components/charts/RidershipTrendChart'
import { ModeComparisonChart } from '@/components/charts/ModeComparisonChart'

const StationMap = dynamic(() => import('@/components/map/StationMap').then(mod => ({ default: mod.StationMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-border bg-card flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export default function Home() {
  return (
    <DashboardShell>
      <GlobalFilters />
      <div className="space-y-8 mt-6">
        <KPISection />

        {/* Time-Series Charts (Thread 3) */}
        <RidershipTrendChart />
        <ModeComparisonChart />

        {/* Interactive Station Map (Thread 4) */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Subway Station Map</h2>
          <StationMap />
        </section>

        {/* Placeholder sections for future threads */}
        <section className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Recovery Chart (Thread 5)</p>
        </section>

        <section className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Congestion Pricing & Day-of-Week Analysis (Thread 5)
          </p>
        </section>
      </div>
    </DashboardShell>
  )
}
