import ResortCard from '@/components/ResortCard'
import Breadcrumb from '@/components/Breadcrumb'
import { resorts } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'

export const metadata = {
  title: 'All-Inclusive Resort Reviews & Ratings 2025',
  description: 'Browse independent ratings and reviews for all-inclusive resorts across the Caribbean and Latin America. Filter by country, type, and category.',
  alternates: { canonical: `${SITE_URL}/resorts/` },
  openGraph: {
    title: 'All-Inclusive Resort Reviews & Ratings 2025',
    description: 'Independent ratings for all-inclusive resorts across food, beach, pool, service, and value.',
    url: `${SITE_URL}/resorts/`,
  },
}

const sorted = [...resorts].sort((a, b) => b.ratings.overall - a.ratings.overall)

export default function AllResortsPage() {
  return (
    <>
      <div className="bg-ocean-950 pt-8 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb dark crumbs={[{ label: 'Home', href: '/' }, { label: 'All Resorts' }]} />
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Complete List</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">All-Inclusive Resorts</h1>
          <p className="font-sans text-ocean-400 mt-3 max-w-xl">
            Every resort independently rated across eleven categories. Sorted by overall score.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((r, i) => (
            <ResortCard key={r.slug} resort={r} rank={i + 1} />
          ))}
        </div>
      </div>
    </>
  )
}
