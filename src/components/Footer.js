import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-2">CalculateTrip</p>
          <p className="text-sm">Independent ratings and reviews for all-inclusive resorts across the Caribbean and Latin America.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Browse</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/resorts/" className="hover:text-white transition-colors">All Resorts</Link></li>
            <li><Link href="/best-adults-only-all-inclusive-resorts/" className="hover:text-white transition-colors">Adults-Only Resorts</Link></li>
            <li><Link href="/best-family-all-inclusive-resorts/" className="hover:text-white transition-colors">Family Resorts</Link></li>
            <li><Link href="/best-value-all-inclusive-resorts/" className="hover:text-white transition-colors">Best Value Resorts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">By Destination</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/destination/panama/" className="hover:text-white transition-colors">Panama</Link></li>
            <li><Link href="/destination/belize/" className="hover:text-white transition-colors">Belize</Link></li>
            <li><Link href="/destination/saint-lucia/" className="hover:text-white transition-colors">Saint Lucia</Link></li>
            <li><Link href="/destination/british-virgin-islands/" className="hover:text-white transition-colors">British Virgin Islands</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-xs text-gray-600">
        <p>Some links on this site are affiliate links. We may earn a commission if you book through them, at no extra cost to you. All ratings are independently researched.</p>
      </div>
    </footer>
  )
}
