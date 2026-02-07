import { Train } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Train className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">NYC Transit Pulse</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
