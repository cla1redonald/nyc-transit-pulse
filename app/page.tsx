import { DashboardShell } from '@/components/layout/DashboardShell'
import { GlobalFilters } from '@/components/filters/GlobalFilters'
import { KPISection } from '@/components/kpi/KPISection'

export default function Home() {
  return (
    <DashboardShell>
      <GlobalFilters />
      <div className="space-y-8 mt-6">
        <KPISection />

        {/* Placeholder sections for future threads */}
        <section className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Ridership Trend Chart (Thread 3)</p>
        </section>

        <section className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Station Map & Recovery Chart (Thread 4 & 5)</p>
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
