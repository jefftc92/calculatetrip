import { Link } from 'wouter'
import ResortCard from '../components/ResortCard'
import { resorts, countries, getAllComparisonPairs } from '../data/resorts'
import { scoreColor } from '../components/RatingBar'

const topResorts = [...resorts].sort((a, b) => b.ratings.overall - a.ratings.overall).slice(0, 3)
const featuredPairs = getAllComparisonPairs().slice(0, 4)

const CATEGORIES = [
  { label: 'Adults-Only Resorts', desc: 'Romance & tranquility, ages 16+', href: '/best-adults-only-all-inclusive-resorts', icon: '🌙' },
  { label: 'Family Resorts', desc: 'Fun for every age group', href: '/best-family-all-inclusive-resorts', icon: '👨‍👩‍👧‍👦' },
  { label: 'Best Value', desc: 'Maximum quality per dollar', href: '/best-value-all-inclusive-resorts', icon: '💰' },
  { label: 'Best Beach', desc: 'Ranked by beach quality score', href: '/best-beach-all-inclusive-resorts', icon: '🏖️' },
]

const STATS = [
  { value: '11', label: 'Rating categories' },
  { value: '9.9', label: 'Highest overall score' },
  { value: String(countries.length), label: 'Destinations covered' },
  { value: '100%', label: 'Independent' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ocean-950 pt-16 pb-24 text-center px-4">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-4">
          All-Inclusive Resort Guide · 2025
        </p>
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
          Find Your Perfect<br />
          <span className="text-gold-400">All-Inclusive</span>
        </h1>
        <p className="font-sans text-ocean-400 text-lg max-w-xl mx-auto mb-10">
          Independent ratings across 11 categories. No sponsored rankings. Real scores.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/resorts"
            className="font-sans font-bold text-sm bg-white text-ocean-950 px-7 py-3.5 rounded-xl hover:bg-ocean-100 transition-colors"
          >
            Browse All Resorts
          </Link>
          <Link
            href="/compare"
            className="font-sans font-bold text-sm bg-gold-500 hover:bg-gold-600 text-white px-7 py-3.5 rounded-xl transition-colors shadow-lg"
          >
            Compare Resorts →
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 divide-x divide-ocean-800 border-t border-ocean-800 max-w-3xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="py-5 px-4">
              <div className="font-serif text-2xl font-bold text-white">{s.value}</div>
              <div className="font-sans text-xs text-ocean-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top-rated section */}
        <section className="py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-1">Highest Rated</p>
              <h2 className="font-serif text-3xl font-bold text-ocean-950">Top-Rated Resorts</h2>
            </div>
            <Link href="/resorts" className="font-sans text-sm text-ocean-600 hover:text-ocean-950 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topResorts.map((r, i) => (
              <ResortCard key={r.slug} resort={r} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 border-t border-ocean-100">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-1">Browse By</p>
          <h2 className="font-serif text-3xl font-bold text-ocean-950 mb-8">Resort Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className="bg-white border border-ocean-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                  <div className="text-2xl mb-3">{cat.icon}</div>
                  <h3 className="font-serif text-base font-bold text-ocean-950 mb-1">{cat.label}</h3>
                  <p className="font-sans text-xs text-ocean-400">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Destinations */}
        <section className="py-10 border-t border-ocean-100">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-1">Browse By</p>
          <h2 className="font-serif text-3xl font-bold text-ocean-950 mb-8">Destination</h2>
          <div className="flex flex-wrap gap-3">
            {countries.map((c) => (
              <Link key={c.slug} href={`/destination/${c.slug}`}>
                <span className="font-sans text-sm font-medium bg-white border border-ocean-200 text-ocean-700 rounded-full px-5 py-2 hover:bg-ocean-50 hover:border-ocean-400 transition-all cursor-pointer shadow-sm">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Compare CTA */}
        <section className="py-10 border-t border-ocean-100 mb-4">
          <div className="bg-ocean-950 rounded-2xl px-8 py-10 text-center">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Side-by-Side</p>
            <h2 className="font-serif text-3xl font-bold text-white mb-3">Compare Any Two Resorts</h2>
            <p className="font-sans text-ocean-400 mb-7 max-w-md mx-auto">
              Pick a resort and see how it stacks up against any other across all 11 rating categories.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {resorts.slice(0, 2).map((r) => (
                <Link
                  key={r.slug}
                  href={`/resorts/${r.slug}`}
                  className="font-sans text-sm font-medium bg-ocean-800 hover:bg-ocean-700 text-white px-5 py-2.5 rounded-xl transition-colors"
                >
                  <span className={`font-bold ${scoreColor(r.ratings.overall)}`}>{r.ratings.overall}</span>
                  {' '}{r.name.split(' ').slice(0, 2).join(' ')}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Compare promo */}
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
                href="/compare"
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
                    href={`/compare/${slug}`}
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
                href="/compare"
                className="block text-center py-2 font-sans text-sm text-ocean-500 hover:text-ocean-800 transition-colors"
              >
                View all comparisons →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
      </div>
    </>
  )
}
