import Link from 'next/link'
import ResortCard from '@/components/ResortCard'
import { resorts, getAllComparisonPairs } from '@/data/resorts'
import { SITE_NAME, SITE_URL } from '@/lib/utils'

export const metadata = {
  title: 'Best All-Inclusive Resorts 2025 | Independent Ratings & Reviews',
  description: 'We rate the best all-inclusive resorts across the Caribbean and Latin America by food, beach, pool, value, service, and more. Find your perfect resort.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: 'Best All-Inclusive Resorts 2025 | Independent Ratings & Reviews',
    description: 'Independently rated all-inclusive resorts ranked by food, beach, pool, value, and service.',
    url: `${SITE_URL}/`,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
}

const topResorts = [...resorts].sort((a, b) => b.ratings.overall - a.ratings.overall).slice(0, 3)
const featuredPairs = getAllComparisonPairs().slice(0, 4)

const categories = [
  { label: 'Adults Only',  sub: 'Romantic escapes, 16+ or 18+', href: '/best-adults-only-all-inclusive-resorts/', icon: '🌙' },
  { label: 'Family',       sub: 'Fun for every age group',       href: '/best-family-all-inclusive-resorts/',        icon: '👨‍👩‍👧' },
  { label: 'Best Value',   sub: 'Most bang for your budget',     href: '/best-value-all-inclusive-resorts/',         icon: '💰' },
  { label: 'Best Beach',   sub: 'Exceptional sand & water',      href: '/best-beach-all-inclusive-resorts/',         icon: '🏖️' },
]

const destinations = [
  { name: 'Panama',                 slug: 'panama',                  count: 2 },
  { name: 'Belize',                 slug: 'belize',                  count: 1 },
  { name: 'Saint Lucia',            slug: 'saint-lucia',             count: 1 },
  { name: 'British Virgin Islands', slug: 'british-virgin-islands',  count: 1 },
]

const stats = [
  { value: '11',          label: 'Rating categories' },
  { value: '9.9',         label: 'Highest overall score' },
  { value: '4',           label: 'Destinations covered' },
  { value: '100%',        label: 'Independent' },
]

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <section className="relative bg-ocean-950 overflow-hidden">
        {/* subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
          <span className="inline-block text-xs font-sans font-semibold uppercase tracking-[0.2em] text-ocean-400 mb-6">
            All-Inclusive Resort Guide · 2025
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Find Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300">
              All-Inclusive
            </span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-ocean-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Independent ratings across food, beach, pool, value, and service — so you can book with total confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/resorts/"
              className="inline-block bg-white text-ocean-950 font-sans font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-ocean-50 transition-colors shadow-lg"
            >
              Browse All Resorts
            </Link>
            <Link
              href="/compare/"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-sans font-bold px-8 py-3.5 rounded-xl text-sm transition-colors shadow-lg"
            >
              Compare Resorts →
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-ocean-800 rounded-2xl overflow-hidden border border-ocean-800">
            {stats.map((s) => (
              <div key={s.label} className="bg-ocean-900 py-5 px-4 text-center">
                <div className="font-serif text-2xl font-bold text-white">{s.value}</div>
                <div className="font-sans text-xs text-ocean-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Rated ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">
              Highest Rated
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ocean-950">
              Top All-Inclusive Resorts
            </h2>
          </div>
          <Link href="/resorts/" className="hidden sm:flex items-center gap-1 font-sans text-sm font-medium text-ocean-700 hover:text-ocean-900 transition-colors">
            View all <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topResorts.map((r, i) => (
            <ResortCard key={r.slug} resort={r} rank={i + 1} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/resorts/" className="font-sans text-sm font-medium text-ocean-700">View all resorts →</Link>
        </div>
      </section>

      {/* ── Compare promo ── */}
      <section className="bg-ocean-50 border-y border-ocean-100 py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Side-by-Side</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-ocean-950 mb-4">
                Compare Any Two Resorts
              </h2>
              <p className="font-sans text-ocean-600 leading-relaxed mb-6">
                See how any two resorts stack up across food, beach, pool, service, value, and eleven rating categories — plus a full amenities checklist and our editorial verdict.
              </p>
              <Link
                href="/compare/"
                className="inline-block bg-ocean-900 hover:bg-ocean-950 text-white font-sans font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Start Comparing →
              </Link>
            </div>
            <div className="space-y-2">
              {featuredPairs.map(({ a, b }) => {
                const slug = `${a.slug}-vs-${b.slug}`
                return (
                  <Link
                    key={slug}
                    href={`/compare/${slug}/`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-ocean-100 hover:border-ocean-300 hover:shadow-card transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-ocean-400 group-hover:text-ocean-600 transition-colors shrink-0 text-sm">→</span>
                      <span className="font-sans text-sm text-ocean-800 group-hover:text-ocean-950 transition-colors truncate">
                        {a.name} vs {b.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <span className="font-sans text-xs font-bold text-emerald-600">{a.ratings.overall}</span>
                      <span className="font-sans text-xs text-ocean-300">vs</span>
                      <span className="font-sans text-xs font-bold text-emerald-600">{b.ratings.overall}</span>
                    </div>
                  </Link>
                )
              })}
              <Link
                href="/compare/"
                className="block text-center py-2 font-sans text-sm text-ocean-500 hover:text-ocean-800 transition-colors"
              >
                View all comparisons →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-ocean-950 py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2 text-center">Browse by Style</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-12">
            What Kind of Trip?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-ocean-900 hover:bg-ocean-800 border border-ocean-800 hover:border-ocean-600 rounded-2xl p-6 transition-all"
              >
                <span className="text-4xl block mb-4">{c.icon}</span>
                <p className="font-serif text-xl font-bold text-white mb-1.5 group-hover:text-gold-400 transition-colors">{c.label}</p>
                <p className="font-sans text-sm text-ocean-400">{c.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Where to Go</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ocean-950 mb-10">Browse by Destination</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destination/${d.slug}/`}
              className="group relative bg-white border border-ocean-100 hover:border-ocean-300 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-center"
            >
              <p className="font-serif text-xl font-bold text-ocean-950 group-hover:text-ocean-700 transition-colors">{d.name}</p>
              <p className="font-sans text-sm text-ocean-400 mt-1">{d.count} {d.count === 1 ? 'resort' : 'resorts'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust band ── */}
      <section className="border-t border-ocean-100 bg-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Our Approach</p>
          <h2 className="font-serif text-3xl font-bold text-ocean-950 mb-5">How We Rate Resorts</h2>
          <p className="font-sans text-ocean-600 max-w-2xl mx-auto leading-relaxed">
            Every resort is scored across eleven categories — food, beach, pool, atmosphere, location, rooms, value, cleanliness, service, and sleep quality — so you can make a decision that matches exactly what matters to you.
          </p>
        </div>
      </section>
    </>
  )
}
