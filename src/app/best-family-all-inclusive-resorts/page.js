import ResortCard from '@/components/ResortCard'
import Breadcrumb from '@/components/Breadcrumb'
import { getResortsByType } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'

export const metadata = {
  title: 'Best Family All-Inclusive Resorts 2025 | Rated & Reviewed',
  description: 'The best family-friendly all-inclusive resorts in the Caribbean and Latin America, independently rated on food, pools, beach, kids\' activities, service, and value.',
  alternates: { canonical: `${SITE_URL}/best-family-all-inclusive-resorts/` },
  openGraph: {
    title: 'Best Family All-Inclusive Resorts 2025 | Rated & Reviewed',
    description: 'Independently rated family all-inclusive resorts for every age group.',
    url: `${SITE_URL}/best-family-all-inclusive-resorts/`,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Best Family All-Inclusive Resorts 2025',
  description: 'Independently rated family-friendly all-inclusive resorts in the Caribbean and Latin America.',
  url: `${SITE_URL}/best-family-all-inclusive-resorts/`,
}

const resorts = getResortsByType('family').sort((a, b) => b.ratings.overall - a.ratings.overall)

export default function FamilyResortsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Family Resorts' }]} />

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Best Family All-Inclusive Resorts 2025
        </h1>
        <p className="text-gray-500 mb-4 max-w-2xl">
          All-inclusive resorts that welcome every age group, rated across pools, food, beach, atmosphere, and value. Everything included — so you can focus on the memories.
        </p>
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-10 text-sm text-green-800">
          <strong>Why choose a family all-inclusive?</strong> One price covers all meals, drinks, snacks, and most activities for the whole family — no surprise bills. The best family resorts also offer kids' clubs, multiple pool areas, and a range of activities for all ages.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resorts.map((r, i) => (
            <ResortCard key={r.slug} resort={r} rank={i + 1} />
          ))}
        </div>
      </div>
    </>
  )
}
