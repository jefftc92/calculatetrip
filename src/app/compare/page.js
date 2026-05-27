import Link from 'next/link'
import { resorts, getAllComparisonPairs } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'
import { scoreColor, scoreLabel } from '@/components/RatingBar'
import ComparePicker from '@/components/ComparePicker'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'Compare All-Inclusive Resorts 2025 | Side-by-Side',
  description: 'Compare any two all-inclusive resorts side by side. Ratings for food, beach, pool, value, service, amenities, and more — all in one place.',
  alternates: { canonical: `${SITE_URL}/compare/` },
  openGraph: {
    title: 'Compare All-Inclusive Resorts 2025 | Side-by-Side',
    description: 'Side-by-side all-inclusive resort comparisons across food, beach, pool, value, and service.',
    url: `${SITE_URL}/compare/`,
  },
}

const pairs = getAllComparisonPairs()

export default function CompareHubPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800 pt-8 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb dark crumbs={[{ label: 'Home', href: '/' }, { label: 'Compare Resorts' }]} />
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ocean-500 mb-2">Head-to-Head</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Compare Resorts</h1>
          <p className="font-sans text-ocean-400 max-w-lg">
            Pick any two all-inclusive resorts and see a full side-by-side breakdown — ratings, amenities, and our verdict.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

        {/* Picker */}
        <div className="mb-12">
          <ComparePicker resorts={resorts} />
        </div>

        {/* All pairs */}
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-4">All Comparisons</p>
        <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-6">Browse Every Match-Up</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pairs.map(({ a, b }) => {
            const winner = a.ratings.overall >= b.ratings.overall ? a : b
            const pair = `${a.slug}-vs-${b.slug}`

            return (
              <Link
                key={pair}
                href={`/compare/${pair}/`}
                className="group bg-white border border-ocean-100 hover:border-ocean-300 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col gap-4"
              >
                {/* Two resorts */}
                <div className="flex items-center justify-between gap-3">
                  {/* Resort A */}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-bold text-ocean-950 leading-snug truncate">{a.name}</p>
                    <p className="font-sans text-xs text-ocean-400 mt-0.5">{a.country}</p>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-sans text-lg font-extrabold tabular-nums ${scoreColor(a.ratings.overall)}`}>
                      {a.ratings.overall}
                    </span>
                    <span className="font-sans text-xs font-bold text-ocean-300">vs</span>
                    <span className={`font-sans text-lg font-extrabold tabular-nums ${scoreColor(b.ratings.overall)}`}>
                      {b.ratings.overall}
                    </span>
                  </div>

                  {/* Resort B */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-serif text-sm font-bold text-ocean-950 leading-snug truncate">{b.name}</p>
                    <p className="font-sans text-xs text-ocean-400 mt-0.5">{b.country}</p>
                  </div>
                </div>

                {/* Winner strip */}
                <div className="flex items-center justify-between pt-3 border-t border-ocean-50">
                  <span className="font-sans text-xs text-ocean-400">Winner</span>
                  <span className="font-sans text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {winner.name.split(' ').slice(0, 2).join(' ')} ({winner.ratings.overall})
                  </span>
                  <span className="font-sans text-xs font-medium text-ocean-600 group-hover:text-ocean-900 transition-colors">
                    Compare →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
