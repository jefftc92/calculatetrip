import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl text-green-700 tracking-tight">
          CalculateTrip
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/resorts/" className="hover:text-green-700 transition-colors">All Resorts</Link>
          <Link href="/best-adults-only-all-inclusive-resorts/" className="hover:text-green-700 transition-colors">Adults Only</Link>
          <Link href="/best-family-all-inclusive-resorts/" className="hover:text-green-700 transition-colors">Family</Link>
          <Link href="/best-value-all-inclusive-resorts/" className="hover:text-green-700 transition-colors">Best Value</Link>
        </div>
      </div>
    </nav>
  )
}
