import { Link } from 'wouter'

export default function Footer() {
  return (
    <footer className="bg-ocean-950 text-ocean-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <span className="font-serif font-bold text-white text-lg">CalculateTrip</span>
            <p className="font-sans text-sm text-ocean-500 mt-2 leading-relaxed">
              Independent ratings and reviews for the best all-inclusive resorts in the Caribbean and Latin America.
            </p>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-600 mb-3">Browse</p>
            <ul className="space-y-2">
              {[
                { label: 'All Resorts', href: '/resorts' },
                { label: 'Adults-Only', href: '/best-adults-only-all-inclusive-resorts' },
                { label: 'Family Resorts', href: '/best-family-all-inclusive-resorts' },
                { label: 'Best Value', href: '/best-value-all-inclusive-resorts' },
                { label: 'Best Beach', href: '/best-beach-all-inclusive-resorts' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-600 mb-3">Destinations</p>
            <ul className="space-y-2">
              {[
                { label: 'Panama', href: '/destination/panama' },
                { label: 'Belize', href: '/destination/belize' },
                { label: 'Saint Lucia', href: '/destination/saint-lucia' },
                { label: 'British Virgin Islands', href: '/destination/british-virgin-islands' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-ocean-800 pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-sans text-xs text-ocean-600">© 2025 CalculateTrip. All rights reserved.</p>
          <p className="font-sans text-xs text-ocean-700">
            Ratings based on independent guest review analysis. Affiliate links may earn commission.
          </p>
        </div>
      </div>
    </footer>
  )
}
