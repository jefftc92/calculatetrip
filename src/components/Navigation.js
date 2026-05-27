import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-ocean-950 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight">CalculateTrip</span>
          <span className="hidden sm:inline text-ocean-400 text-xs font-sans uppercase tracking-widest mt-0.5">
            All-Inclusive Guide
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm font-sans">
          <Link href="/resorts/" className="px-3 py-1.5 rounded-lg text-ocean-200 hover:text-white hover:bg-ocean-800 transition-all">
            All Resorts
          </Link>
          <Link href="/best-adults-only-all-inclusive-resorts/" className="hidden md:block px-3 py-1.5 rounded-lg text-ocean-200 hover:text-white hover:bg-ocean-800 transition-all">
            Adults Only
          </Link>
          <Link href="/best-family-all-inclusive-resorts/" className="hidden md:block px-3 py-1.5 rounded-lg text-ocean-200 hover:text-white hover:bg-ocean-800 transition-all">
            Family
          </Link>
          <Link href="/best-value-all-inclusive-resorts/" className="hidden lg:block px-3 py-1.5 rounded-lg text-ocean-200 hover:text-white hover:bg-ocean-800 transition-all">
            Best Value
          </Link>
          <Link href="/compare/" className="px-3 py-1.5 rounded-lg bg-ocean-700 text-white hover:bg-ocean-600 transition-all font-semibold">
            Compare
          </Link>
        </div>
      </div>
    </nav>
  )
}
