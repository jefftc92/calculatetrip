import ResortCard from '@/components/ResortCard'
import Breadcrumb from '@/components/Breadcrumb'
import { resorts } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'

export const metadata = {
  title: 'Best Beach All-Inclusive Resorts 2025 | Rated by Beach Quality',
  description: 'All-inclusive resorts ranked by independent beach ratings. Find the best private beach, crystal water, and sand at resorts across the Caribbean and Latin America.',
  alternates: { canonical: `${SITE_URL}/best-beach-all-inclusive-resorts/` },
  openGraph: {
    title: 'Best Beach All-Inclusive Resorts 2025 | Rated by Beach Quality',
    description: 'Independently rated beach all-inclusive resorts across the Caribbean.',
    url: `${SITE_URL}/best-beach-all-inclusive-resorts/`,
  },
}

const sorted = [...resorts]
  .filter((r) => r.ratings.beach !== null)
  .sort((a, b) => b.ratings.beach - a.ratings.beach)

export default function BestBeachPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Best Beach Resorts' }]} />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        Best Beach All-Inclusive Resorts 2025
      </h1>
      <p className="text-gray-500 mb-4 max-w-2xl">
        Ranked by independent beach quality score — covering sand, water clarity, privacy, and access. All resorts include beach amenities in the all-inclusive rate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
