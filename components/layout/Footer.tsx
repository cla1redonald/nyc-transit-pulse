export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Data:{' '}
            <a
              href="https://data.ny.gov/Transportation/MTA-Daily-Ridership-Data-2020-2025/vxuj-8kew"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              MTA Open Data
            </a>
            {' '}(2020-2025)
          </p>
          <p className="text-sm text-muted-foreground">
            Built with{' '}
            <span className="font-medium">Next.js</span>,{' '}
            <span className="font-medium">Recharts</span>, and{' '}
            <span className="font-medium">Leaflet</span>
          </p>
          <p className="text-xs text-muted-foreground/70">
            Last data update: February 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
