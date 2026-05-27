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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'All Resorts' }]} />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        All-Inclusive Resort Reviews &amp; Ratings 2025
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Every resort independently rated across food, beach, pool, atmosphere, value, service, and more. Sorted by overall score.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
